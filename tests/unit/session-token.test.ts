import { describe, it, expect } from 'vitest';
import { createHmac } from 'crypto';
import {
  createSessionToken,
  verifySessionToken,
  buildSessionCookieOptions,
  buildClearedSessionCookie,
  safeEqual,
  SESSION_COOKIE,
  SESSION_DURATION_SEC,
  type SessionData,
} from '@/app/lib/admin/session-token';

const BASE: Omit<SessionData, 'exp'> = {
  userId: 'usr-001',
  role: 'staff',
  name: 'Kumar Muthu',
  email: 'staff@darshana.com',
  ver: 0,
};

/** Re-signs an arbitrary payload with the real secret, as an attacker with the key could not do. */
function signPayload(payload: object): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = createHmac('sha256', process.env.SESSION_SECRET!).update(body).digest('base64url');
  return `${body}.${sig}`;
}

describe('createSessionToken / verifySessionToken', () => {
  it('round-trips a valid session', () => {
    const session = verifySessionToken(createSessionToken(BASE));
    expect(session).toMatchObject({ userId: 'usr-001', role: 'staff', ver: 0 });
  });

  it('sets an expiry one session-duration in the future', () => {
    const { exp } = verifySessionToken(createSessionToken(BASE))!;
    const expected = Math.floor(Date.now() / 1000) + SESSION_DURATION_SEC;
    expect(Math.abs(exp - expected)).toBeLessThan(5);
  });

  it('rejects a payload rewritten to escalate role', () => {
    // The core forgery case: take a real staff token, swap the role to admin,
    // and keep the original signature.
    const token = createSessionToken(BASE);
    const [, sig] = token.split('.');
    const forgedBody = Buffer.from(
      JSON.stringify({ ...BASE, role: 'admin', exp: Math.floor(Date.now() / 1000) + 600 })
    ).toString('base64url');
    expect(verifySessionToken(`${forgedBody}.${sig}`)).toBeNull();
  });

  it('rejects a tampered signature', () => {
    const token = createSessionToken(BASE);
    expect(verifySessionToken(`${token.slice(0, -4)}AAAA`)).toBeNull();
  });

  it('rejects a token with no signature segment', () => {
    expect(verifySessionToken(createSessionToken(BASE).split('.')[0])).toBeNull();
  });

  it('rejects an expired token even when correctly signed', () => {
    expect(verifySessionToken(signPayload({ ...BASE, exp: Math.floor(Date.now() / 1000) - 1 }))).toBeNull();
  });

  it('rejects a role outside the allowed set', () => {
    expect(verifySessionToken(signPayload({ ...BASE, role: 'superadmin', exp: Date.now() / 1000 + 600 }))).toBeNull();
  });

  it('rejects pre-versioning cookies so the hardening forces a fresh sign-in', () => {
    const { ver, ...withoutVer } = BASE;
    expect(verifySessionToken(signPayload({ ...withoutVer, exp: Date.now() / 1000 + 600 }))).toBeNull();
  });

  it.each([undefined, null, '', '...', 'not-a-token', 'a.b.c'])('rejects malformed input %j', (input) => {
    expect(verifySessionToken(input as string)).toBeNull();
  });

  it('rejects a token signed with a different secret', () => {
    const body = Buffer.from(JSON.stringify({ ...BASE, exp: Date.now() / 1000 + 600 })).toString('base64url');
    const sig = createHmac('sha256', 'some-other-secret-value-32-chars-long').update(body).digest('base64url');
    expect(verifySessionToken(`${body}.${sig}`)).toBeNull();
  });

  it('surfaces a misconfigured secret instead of silently logging everyone out', () => {
    // A config fault must throw, not look like an invalid cookie — otherwise a
    // bad deploy presents as a mass logout with no explanation.
    const original = process.env.SESSION_SECRET;
    const token = createSessionToken(BASE);
    try {
      process.env.SESSION_SECRET = 'too-short';
      expect(() => verifySessionToken(token)).toThrow(/at least 32/i);
      delete process.env.SESSION_SECRET;
      expect(() => verifySessionToken(token)).toThrow(/not set/i);
    } finally {
      process.env.SESSION_SECRET = original;
    }
  });
});

describe('safeEqual', () => {
  it('compares equal and unequal strings without throwing on length mismatch', () => {
    expect(safeEqual('abc', 'abc')).toBe(true);
    expect(safeEqual('abc', 'abd')).toBe(false);
    expect(safeEqual('short', 'a-much-longer-value')).toBe(false);
    expect(safeEqual('', '')).toBe(true);
  });
});

describe('cookie options', () => {
  it('is httpOnly, lax and scoped to the whole site', () => {
    const c = buildSessionCookieOptions('token-value');
    expect(c).toMatchObject({
      name: SESSION_COOKIE,
      value: 'token-value',
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_DURATION_SEC,
    });
  });

  it('clears with an empty value and zero max-age', () => {
    expect(buildClearedSessionCookie()).toMatchObject({ name: SESSION_COOKIE, value: '', maxAge: 0 });
  });
});

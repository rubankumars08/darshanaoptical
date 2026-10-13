import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createHmac } from 'crypto';
import { hashPassword } from '@/app/lib/admin/password';
import { verifySessionToken } from '@/app/lib/admin/session-token';

const MAX_ATTEMPTS = 8;
const LOCK_MS = 15 * 60_000;
const WINDOW_MS = 15 * 60_000;

const db = vi.hoisted(() => ({
  users: [] as any[],
  attempts: new Map<string, { attempts: number; last_failed_at: number; locked_until: number | null }>(),
  now: Date.UTC(2026, 0, 1, 12, 0, 0),
  updates: [] as { sql: string; params: any[] }[],
  error: null as Error | null,
}));

vi.mock('@/app/lib/db', () => ({
  query: vi.fn(async (sql: string, params: any[] = []) => {
    if (db.error) throw db.error;
    if (/SELECT locked_until/.test(sql)) {
      const row = db.attempts.get(params[0]);
      if (!row) return [];
      return [{ locked_until: row.locked_until, retry: row.locked_until ? Math.ceil((row.locked_until - db.now) / 1000) : null }];
    }
    if (/INSERT INTO login_attempts/.test(sql)) {
      const id = params[0];
      const prev = db.attempts.get(id);
      const attempts = !prev ? 1 : prev.last_failed_at < db.now - WINDOW_MS ? 1 : prev.attempts + 1;
      db.attempts.set(id, {
        attempts,
        locked_until: attempts >= MAX_ATTEMPTS ? db.now + LOCK_MS : null,
        last_failed_at: db.now,
      });
      return { affectedRows: 1 };
    }
    if (/DELETE FROM login_attempts/.test(sql)) {
      for (const p of params) db.attempts.delete(p);
      return { affectedRows: 1 };
    }
    if (/FROM users WHERE email/.test(sql)) {
      return db.users.filter((u) => u.email === params[0]);
    }
    if (/UPDATE users/.test(sql)) {
      db.updates.push({ sql, params });
      if (/password_hash/.test(sql)) {
        const user = db.users.find((u) => u.id === params[1]);
        if (user) user.password_hash = params[0];
      }
      return { affectedRows: 1 };
    }
    return [];
  }),
  withTransaction: vi.fn(),
  getDbPool: vi.fn(),
}));

const { POST } = await import('@/app/api/admin/auth/login/route');

const loginRequest = (body: unknown, ip = '203.0.113.5') =>
  new Request('http://localhost/api/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify(body),
  });

const GOOD = 'correct-horse-7';

beforeEach(async () => {
  db.users = [
    {
      id: 'usr-001', name: 'Darshana Raj', email: 'admin@darshana.com',
      role: 'admin', status: 'active', token_version: 3,
      password_hash: await hashPassword(GOOD),
    },
  ];
  db.attempts.clear();
  db.updates = [];
  db.error = null;
  db.now = Date.UTC(2026, 0, 1, 12, 0, 0);
});

describe('successful sign-in', () => {
  it('returns the user and sets a session cookie', async () => {
    const res = await POST(loginRequest({ email: 'admin@darshana.com', password: GOOD }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.user).toMatchObject({ email: 'admin@darshana.com', role: 'admin' });
    expect(body.user.password_hash).toBeUndefined();

    const cookie = res.cookies.get('darshana_session');
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe('lax');
  });

  it('issues a token carrying the current token_version', async () => {
    const res = await POST(loginRequest({ email: 'admin@darshana.com', password: GOOD }));
    const session = verifySessionToken(res.cookies.get('darshana_session')!.value);
    expect(session).toMatchObject({ userId: 'usr-001', role: 'admin', ver: 3 });
  });

  it('is case- and whitespace-insensitive about the email', async () => {
    const res = await POST(loginRequest({ email: '  ADMIN@Darshana.com ', password: GOOD }));
    expect(res.status).toBe(200);
  });

  it('records last_active', async () => {
    await POST(loginRequest({ email: 'admin@darshana.com', password: GOOD }));
    expect(db.updates.some((u) => /last_active/.test(u.sql))).toBe(true);
  });

  it('clears the failure counter', async () => {
    for (let i = 0; i < 3; i++) await POST(loginRequest({ email: 'admin@darshana.com', password: 'wrong' }));
    expect(db.attempts.size).toBeGreaterThan(0);
    await POST(loginRequest({ email: 'admin@darshana.com', password: GOOD }));
    expect(db.attempts.size).toBe(0);
  });
});

describe('failed sign-in', () => {
  it('rejects malformed JSON with 400', async () => {
    const request = new Request('http://localhost/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{not-json',
    });
    const res = await POST(request);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'Invalid JSON body.' });
  });

  it('reports database configuration failures as a retryable 503', async () => {
    db.error = new Error('[db] DATABASE_URL environment variable is not set.');
    const res = await POST(loginRequest({ email: 'admin@darshana.com', password: GOOD }));
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({ code: 'DATABASE_UNAVAILABLE' });
  });

  it('rejects a wrong password without a cookie', async () => {
    const res = await POST(loginRequest({ email: 'admin@darshana.com', password: 'wrong' }));
    expect(res.status).toBe(401);
    expect(res.cookies.get('darshana_session')).toBeUndefined();
  });

  it('gives the same message for unknown email and wrong password', async () => {
    // Prevents using the login form to discover which staff emails exist.
    const unknown = await POST(loginRequest({ email: 'nobody@darshana.com', password: GOOD }));
    const wrongPw = await POST(loginRequest({ email: 'admin@darshana.com', password: 'wrong' }));
    expect(unknown.status).toBe(wrongPw.status);
    expect((await unknown.json()).error).toBe((await wrongPw.json()).error);
  });

  it('does not reveal that an account is deactivated', async () => {
    db.users[0].status = 'inactive';
    const res = await POST(loginRequest({ email: 'admin@darshana.com', password: GOOD }));
    expect(res.status).toBe(401);
    expect((await res.json()).error).toMatch(/invalid email or password/i);
  });

  it('refuses to sign in a deactivated account', async () => {
    db.users[0].status = 'inactive';
    const res = await POST(loginRequest({ email: 'admin@darshana.com', password: GOOD }));
    expect(res.cookies.get('darshana_session')).toBeUndefined();
  });

  it.each([
    ['missing password', { email: 'admin@darshana.com' }],
    ['missing email', { password: GOOD }],
    ['empty body', {}],
    ['non-string email', { email: 123, password: GOOD }],
  ])('rejects %s with 400', async (_label, body) => {
    expect((await POST(loginRequest(body))).status).toBe(400);
  });
});

describe('brute-force throttle', () => {
  it('locks the account after eight failures and returns 429 with Retry-After', async () => {
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      const res = await POST(loginRequest({ email: 'admin@darshana.com', password: 'wrong' }));
      expect(res.status).toBe(401);
      db.now += 1000;
    }
    const locked = await POST(loginRequest({ email: 'admin@darshana.com', password: 'wrong' }));
    expect(locked.status).toBe(429);
    expect(Number(locked.headers.get('Retry-After'))).toBeGreaterThan(0);
    expect((await locked.json()).error).toMatch(/too many failed attempts/i);
  });

  it('rejects even the correct password while locked', async () => {
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      await POST(loginRequest({ email: 'admin@darshana.com', password: 'wrong' }));
      db.now += 1000;
    }
    const res = await POST(loginRequest({ email: 'admin@darshana.com', password: GOOD }));
    expect(res.status).toBe(429);
    expect(res.cookies.get('darshana_session')).toBeUndefined();
  });

  it('allows sign-in again once the lock expires', async () => {
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      await POST(loginRequest({ email: 'admin@darshana.com', password: 'wrong' }));
      db.now += 1000;
    }
    db.now += LOCK_MS;
    expect((await POST(loginRequest({ email: 'admin@darshana.com', password: GOOD }))).status).toBe(200);
  });

  it('throttles an unknown email too, so probing is not free', async () => {
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      await POST(loginRequest({ email: 'guess@darshana.com', password: 'x' }));
      db.now += 1000;
    }
    expect((await POST(loginRequest({ email: 'guess@darshana.com', password: 'x' }))).status).toBe(429);
  });
});

describe('legacy password migration', () => {
  const LEGACY_PW = 'admin@2026';

  beforeEach(() => {
    db.users[0].password_hash = createHmac('sha256', process.env.SESSION_SECRET!).update(LEGACY_PW).digest('hex');
  });

  it('still accepts a password stored with the old unsalted scheme', async () => {
    expect((await POST(loginRequest({ email: 'admin@darshana.com', password: LEGACY_PW }))).status).toBe(200);
  });

  it('upgrades the stored hash to scrypt on that sign-in', async () => {
    await POST(loginRequest({ email: 'admin@darshana.com', password: LEGACY_PW }));
    expect(db.users[0].password_hash.startsWith('scrypt$')).toBe(true);
  });

  it('the upgraded hash still verifies on the next sign-in', async () => {
    await POST(loginRequest({ email: 'admin@darshana.com', password: LEGACY_PW }));
    db.attempts.clear();
    expect((await POST(loginRequest({ email: 'admin@darshana.com', password: LEGACY_PW }))).status).toBe(200);
  });

  it('does not upgrade on a failed attempt', async () => {
    await POST(loginRequest({ email: 'admin@darshana.com', password: 'wrong' }));
    expect(db.users[0].password_hash.startsWith('scrypt$')).toBe(false);
  });
});

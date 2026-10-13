import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * In-memory stand-in for the login_attempts table.
 *
 * It implements the same semantics as the real statement, including the detail
 * the production SQL depends on: MySQL evaluates ON DUPLICATE KEY UPDATE
 * assignments left to right, so `attempts` is already the new value when
 * locked_until is computed, while last_failed_at is still the old one.
 */
const MAX_ATTEMPTS = 8;
const LOCK_MS = 15 * 60_000;
const WINDOW_MS = 15 * 60_000;

interface Row { attempts: number; last_failed_at: number; locked_until: number | null }
const table = new Map<string, Row>();
let now = Date.UTC(2026, 0, 1, 12, 0, 0);
const advance = (ms: number) => { now += ms; };

vi.mock('@/app/lib/db', () => ({
  query: vi.fn(async (sql: string, params: any[] = []) => {
    if (sql.includes('SELECT locked_until')) {
      const row = table.get(params[0]);
      if (!row) return [];
      return [{
        locked_until: row.locked_until,
        retry: row.locked_until ? Math.ceil((row.locked_until - now) / 1000) : null,
      }];
    }
    if (sql.includes('INSERT INTO login_attempts')) {
      const id = params[0];
      const existing = table.get(id);
      if (!existing) {
        table.set(id, { attempts: 1, last_failed_at: now, locked_until: null });
      } else {
        const attempts = existing.last_failed_at < now - WINDOW_MS ? 1 : existing.attempts + 1;
        table.set(id, {
          attempts,
          locked_until: attempts >= MAX_ATTEMPTS ? now + LOCK_MS : null,
          last_failed_at: now,
        });
      }
      return { affectedRows: 1 };
    }
    if (sql.includes('DELETE FROM login_attempts')) {
      for (const p of params) table.delete(p);
      return { affectedRows: 1 };
    }
    throw new Error(`unexpected SQL in test: ${sql}`);
  }),
}));

const { checkLoginAllowed, recordLoginFailure, clearLoginAttempts, clientIp } =
  await import('@/app/lib/admin/rate-limit');

const EMAIL = 'admin@darshana.com';
const IP = '203.0.113.9';

beforeEach(() => {
  table.clear();
  now = Date.UTC(2026, 0, 1, 12, 0, 0);
});

describe('login throttle', () => {
  it('allows the first attempt', async () => {
    expect(await checkLoginAllowed(EMAIL, IP)).toEqual({ locked: false, retryAfterSec: 0 });
  });

  it('stays unlocked for the first seven failures and locks on the eighth', async () => {
    for (let i = 1; i <= 7; i++) {
      await recordLoginFailure(EMAIL, IP);
      advance(1000);
      expect((await checkLoginAllowed(EMAIL, IP)).locked, `after failure ${i}`).toBe(false);
    }
    await recordLoginFailure(EMAIL, IP);
    const status = await checkLoginAllowed(EMAIL, IP);
    expect(status.locked).toBe(true);
    expect(status.retryAfterSec).toBeGreaterThan(0);
    expect(status.retryAfterSec).toBeLessThanOrEqual(15 * 60);
  });

  it('releases the lock once the window passes', async () => {
    for (let i = 0; i < MAX_ATTEMPTS; i++) { await recordLoginFailure(EMAIL, IP); advance(1000); }
    expect((await checkLoginAllowed(EMAIL, IP)).locked).toBe(true);
    advance(LOCK_MS);
    expect((await checkLoginAllowed(EMAIL, IP)).locked).toBe(false);
  });

  it('starts a fresh count after the window rather than re-locking immediately', async () => {
    for (let i = 0; i < MAX_ATTEMPTS; i++) { await recordLoginFailure(EMAIL, IP); advance(1000); }
    advance(LOCK_MS + 1000);
    await recordLoginFailure(EMAIL, IP);
    expect((await checkLoginAllowed(EMAIL, IP)).locked).toBe(false);
    expect(table.get(`email:${EMAIL}`)!.attempts).toBe(1);
  });

  it('a successful sign-in clears the counter', async () => {
    for (let i = 0; i < 5; i++) { await recordLoginFailure(EMAIL, IP); advance(1000); }
    await clearLoginAttempts(EMAIL, IP);
    expect(table.has(`email:${EMAIL}`)).toBe(false);
    expect(table.has(`ip:${IP}`)).toBe(false);
    // Seven more failures must still not lock, proving the count really reset.
    for (let i = 0; i < 7; i++) { await recordLoginFailure(EMAIL, IP); advance(1000); }
    expect((await checkLoginAllowed(EMAIL, IP)).locked).toBe(false);
  });

  it('never locks an account that keeps succeeding between failures', async () => {
    for (let round = 0; round < 5; round++) {
      for (let i = 0; i < 7; i++) { await recordLoginFailure(EMAIL, IP); advance(1000); }
      await clearLoginAttempts(EMAIL, IP);
      expect((await checkLoginAllowed(EMAIL, IP)).locked).toBe(false);
    }
  });

  it('locks the IP even when the attacker rotates the email (spray)', async () => {
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      await recordLoginFailure(`victim${i}@darshana.com`, IP);
      advance(1000);
    }
    // A fresh, never-tried email from the same IP is still blocked.
    expect((await checkLoginAllowed('someone-new@darshana.com', IP)).locked).toBe(true);
  });

  it('locks the email even when the attacker rotates the IP', async () => {
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      await recordLoginFailure(EMAIL, `198.51.100.${i}`);
      advance(1000);
    }
    expect((await checkLoginAllowed(EMAIL, '198.51.100.250')).locked).toBe(true);
  });

  it('does not lock an unrelated user because someone else was throttled', async () => {
    for (let i = 0; i < MAX_ATTEMPTS; i++) { await recordLoginFailure(EMAIL, IP); advance(1000); }
    expect((await checkLoginAllowed('other@darshana.com', '192.0.2.50')).locked).toBe(false);
  });
});

describe('clientIp', () => {
  const req = (headers: Record<string, string>) => new Request('http://localhost/api', { headers });

  it('takes the first entry of x-forwarded-for', () => {
    expect(clientIp(req({ 'x-forwarded-for': '203.0.113.1, 70.41.3.18' }))).toBe('203.0.113.1');
  });

  it('falls back to x-real-ip then cf-connecting-ip', () => {
    expect(clientIp(req({ 'x-real-ip': '198.51.100.7' }))).toBe('198.51.100.7');
    expect(clientIp(req({ 'cf-connecting-ip': '198.51.100.8' }))).toBe('198.51.100.8');
  });

  it('returns "unknown" when no header is present', () => {
    expect(clientIp(req({}))).toBe('unknown');
  });

  it('caps the length so a huge header cannot overflow the key column', () => {
    expect(clientIp(req({ 'x-forwarded-for': 'a'.repeat(500) })).length).toBeLessThanOrEqual(100);
  });
});

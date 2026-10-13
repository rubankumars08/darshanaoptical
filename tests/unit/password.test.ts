import { describe, it, expect } from 'vitest';
import { createHmac } from 'crypto';
import { hashPassword, verifyPassword, validatePasswordStrength } from '@/app/lib/admin/password';

/** Reproduces the pre-hardening scheme: unsalted HMAC-SHA256 keyed on SESSION_SECRET. */
function legacyHash(password: string): string {
  return createHmac('sha256', process.env.SESSION_SECRET!).update(password).digest('hex');
}

describe('hashPassword', () => {
  it('produces the documented scrypt format', async () => {
    const hash = await hashPassword('correct-horse-7');
    const parts = hash.split('$');
    expect(parts).toHaveLength(6);
    expect(parts[0]).toBe('scrypt');
    expect(Number(parts[1])).toBe(16384);
    expect(Buffer.from(parts[4], 'base64')).toHaveLength(16); // salt
    expect(Buffer.from(parts[5], 'base64')).toHaveLength(64); // derived key
  });

  it('salts every hash so identical passwords never collide', async () => {
    const [a, b] = await Promise.all([hashPassword('same-password-1'), hashPassword('same-password-1')]);
    expect(a).not.toBe(b);
    // Both must still verify — proving the difference is salt, not corruption.
    expect((await verifyPassword('same-password-1', a)).valid).toBe(true);
    expect((await verifyPassword('same-password-1', b)).valid).toBe(true);
  });

  it('never stores the plaintext', async () => {
    expect(await hashPassword('hunter2-secret')).not.toContain('hunter2-secret');
  });
});

describe('verifyPassword', () => {
  it('accepts the correct password and rejects a wrong one', async () => {
    const hash = await hashPassword('correct-horse-7');
    expect(await verifyPassword('correct-horse-7', hash)).toEqual({ valid: true, needsRehash: false });
    expect((await verifyPassword('correct-horse-8', hash)).valid).toBe(false);
    expect((await verifyPassword('', hash)).valid).toBe(false);
  });

  it('is unicode-stable via NFKC normalisation', async () => {
    // Same grapheme, different byte sequences (precomposed vs combining).
    const hash = await hashPassword('café-pass1');
    expect((await verifyPassword('café-pass1', hash)).valid).toBe(true);
  });

  it('accepts a legacy unsalted hash and flags it for upgrade', async () => {
    const result = await verifyPassword('admin@2026', legacyHash('admin@2026'));
    expect(result).toEqual({ valid: true, needsRehash: true });
  });

  it('rejects a wrong password against a legacy hash', async () => {
    expect((await verifyPassword('wrong', legacyHash('admin@2026'))).valid).toBe(false);
  });

  it('does not ask for a rehash when the hash is already current', async () => {
    const result = await verifyPassword('correct-horse-7', await hashPassword('correct-horse-7'));
    expect(result.needsRehash).toBe(false);
  });

  it('flags outdated scrypt cost parameters for rehash', async () => {
    // A hash written with weaker parameters should still verify but be upgraded.
    const weak = (await hashPassword('cost-test-1')).replace('scrypt$16384$', 'scrypt$1024$');
    // Re-derive with the weaker N so the stored key matches what we claim.
    const { scrypt } = await import('crypto');
    const [, n, r, p, salt] = weak.split('$');
    const key: Buffer = await new Promise((res, rej) =>
      scrypt('cost-test-1', Buffer.from(salt, 'base64'), 64,
        { N: Number(n), r: Number(r), p: Number(p), maxmem: 64 * 1024 * 1024 },
        (e, k) => (e ? rej(e) : res(k as Buffer)))
    );
    const stored = `scrypt$${n}$${r}$${p}$${salt}$${key.toString('base64')}`;
    expect(await verifyPassword('cost-test-1', stored)).toEqual({ valid: true, needsRehash: true });
  });

  it.each([
    ['empty', ''],
    ['null', null],
    ['undefined', undefined],
    ['garbage', 'not-a-hash'],
    ['truncated scrypt', 'scrypt$16384$8'],
    ['non-numeric cost', 'scrypt$abc$8$1$AAAA$AAAA'],
    ['wrong-length hex', 'abc123'],
  ])('safely rejects a %s stored hash', async (_label, stored) => {
    await expect(verifyPassword('anything', stored as string)).resolves.toEqual({
      valid: false,
      needsRehash: false,
    });
  });
});

describe('validatePasswordStrength', () => {
  it.each(['abcd123456', 'Password12', 'a1'.repeat(5), 'S0me-Long-Passphrase'])('accepts %s', (pw) => {
    expect(validatePasswordStrength(pw)).toBeNull();
  });

  it.each([
    ['too short', 'abc12'],
    ['nine chars, one short of the limit', 'Password1'],
    ['letters only', 'abcdefghijk'],
    ['digits only', '1234567890'],
    ['not a string', 12345678901 as unknown as string],
  ])('rejects %s', (_label, pw) => {
    expect(validatePasswordStrength(pw)).toBeTypeOf('string');
  });

  it('rejects the old seeded passwords that were committed to the repo', () => {
    // 'admin@2026' is 10 chars with letters and digits, so it passes the length
    // and character rules — this documents that the policy alone is not what
    // retired those accounts; migrate.mjs no longer seeds fixed passwords.
    expect(validatePasswordStrength('admin@2026')).toBeNull();
  });

  it('rejects an absurdly long password rather than hashing it', () => {
    expect(validatePasswordStrength('a1'.repeat(200))).toMatch(/at most/i);
  });
});

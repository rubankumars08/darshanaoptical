// app/lib/admin/password.ts
// Server-only password hashing.
//
// Passwords use scrypt with a random per-user salt. The previous scheme was a
// single unsalted HMAC-SHA256 keyed with SESSION_SECRET, which meant one leaked
// secret exposed every password to fast offline cracking, and identical
// passwords produced identical hashes. `verifyPassword` still accepts those old
// hashes so existing staff can log in; the login route re-hashes them on the
// next successful sign-in (see `needsRehash`).

import { createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(scryptCb) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number }
) => Promise<Buffer>;

// scrypt cost parameters. N must stay a power of two; maxmem has to exceed
// roughly 128 * N * r bytes or Node throws.
const N = 16384;
const R = 8;
const P = 1;
const KEYLEN = 64;
const MAXMEM = 64 * 1024 * 1024;

const LEGACY_HEX = /^[0-9a-f]{64}$/i;

function legacySecret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error('[password] SESSION_SECRET env variable is not set.');
  return s;
}

/** Minimum policy for new / changed passwords. Returns an error string, or null when valid. */
export function validatePasswordStrength(password: unknown): string | null {
  if (typeof password !== 'string') return 'Password must be a string.';
  if (password.length < 10) return 'Password must be at least 10 characters.';
  if (password.length > 200) return 'Password must be at most 200 characters.';
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Password must contain at least one letter and one number.';
  }
  return null;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password.normalize('NFKC'), salt, KEYLEN, { N, r: R, p: P, maxmem: MAXMEM });
  return `scrypt$${N}$${R}$${P}$${salt.toString('base64')}$${key.toString('base64')}`;
}

export interface VerifyResult {
  valid: boolean;
  /** True when the stored hash used the old scheme and should be upgraded. */
  needsRehash: boolean;
}

export async function verifyPassword(password: string, stored: string | null | undefined): Promise<VerifyResult> {
  if (!stored || typeof password !== 'string') return { valid: false, needsRehash: false };

  if (stored.startsWith('scrypt$')) {
    const parts = stored.split('$');
    if (parts.length !== 6) return { valid: false, needsRehash: false };
    const [, nStr, rStr, pStr, saltB64, keyB64] = parts;
    const n = Number(nStr);
    const r = Number(rStr);
    const p = Number(pStr);
    if (!Number.isInteger(n) || !Number.isInteger(r) || !Number.isInteger(p)) {
      return { valid: false, needsRehash: false };
    }
    let expected: Buffer;
    try {
      expected = Buffer.from(keyB64, 'base64');
    } catch {
      return { valid: false, needsRehash: false };
    }
    const actual = await scrypt(password.normalize('NFKC'), Buffer.from(saltB64, 'base64'), expected.length, {
      N: n,
      r,
      p,
      maxmem: MAXMEM,
    });
    const valid = actual.length === expected.length && timingSafeEqual(actual, expected);
    // Re-hash if the stored cost parameters are weaker than the current defaults.
    return { valid, needsRehash: valid && (n !== N || r !== R || p !== P) };
  }

  if (LEGACY_HEX.test(stored)) {
    const legacy = createHmac('sha256', legacySecret()).update(password).digest();
    const storedBuf = Buffer.from(stored, 'hex');
    const valid = legacy.length === storedBuf.length && timingSafeEqual(legacy, storedBuf);
    return { valid, needsRehash: valid };
  }

  return { valid: false, needsRehash: false };
}

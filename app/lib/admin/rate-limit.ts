// app/lib/admin/rate-limit.ts
// Database-backed login throttle.
//
// Kept in the database rather than in a module-level Map because the app may run
// on more than one instance (and serverless instances are recycled), where an
// in-memory counter resets and stops limiting anything. Counting per email AND
// per IP means an attacker can neither grind one account nor spray many.

import { query } from '@/app/lib/db';

const MAX_ATTEMPTS = 8;
const LOCK_MINUTES = 15;
/** Failures older than this stop counting toward a lockout. */
const WINDOW_MINUTES = 15;

export interface LockStatus {
  locked: boolean;
  retryAfterSec: number;
}

export function clientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]!.trim().slice(0, 100);
  return (
    request.headers.get('x-real-ip')?.slice(0, 100) ??
    request.headers.get('cf-connecting-ip')?.slice(0, 100) ??
    'unknown'
  );
}

async function statusFor(identifier: string): Promise<LockStatus> {
  const rows = (await query(
    'SELECT locked_until, TIMESTAMPDIFF(SECOND, NOW(), locked_until) AS retry FROM login_attempts WHERE identifier = ? LIMIT 1',
    [identifier]
  )) as any[];
  const row = rows[0];
  const retry = Number(row?.retry ?? 0);
  if (!row?.locked_until || retry <= 0) return { locked: false, retryAfterSec: 0 };
  return { locked: true, retryAfterSec: retry };
}

/** Returns the lock status for this email + IP pair. Call before checking the password. */
export async function checkLoginAllowed(email: string, ip: string): Promise<LockStatus> {
  const [byEmail, byIp] = await Promise.all([
    statusFor(`email:${email}`),
    statusFor(`ip:${ip}`),
  ]);
  if (byEmail.locked || byIp.locked) {
    return {
      locked: true,
      retryAfterSec: Math.max(byEmail.retryAfterSec, byIp.retryAfterSec),
    };
  }
  return { locked: false, retryAfterSec: 0 };
}

async function bumpFailure(identifier: string): Promise<void> {
  // Reset the counter when the last failure fell outside the window, otherwise
  // increment; lock once the threshold is reached. Done in one statement so
  // concurrent attempts cannot interleave a read and a write.
  //
  // The thresholds are interpolated rather than bound: they are module
  // constants, never user input, and `INTERVAL ? MINUTE` is not reliably
  // supported as a placeholder in prepared statements. `identifier` is the only
  // caller-derived value and stays parameterised.
  // Assignment order matters and is relied on here: MySQL evaluates ON DUPLICATE
  // KEY UPDATE assignments left to right, so `attempts` in the locked_until line
  // is already the value set by the line above it, while `last_failed_at` is
  // still the previous timestamp because it is assigned last.
  await query(
    `INSERT INTO login_attempts (identifier, attempts, last_failed_at, locked_until)
       VALUES (?, 1, NOW(), NULL)
     ON DUPLICATE KEY UPDATE
       attempts = IF(last_failed_at < NOW() - INTERVAL ${WINDOW_MINUTES} MINUTE, 1, attempts + 1),
       locked_until = IF(attempts >= ${MAX_ATTEMPTS}, NOW() + INTERVAL ${LOCK_MINUTES} MINUTE, NULL),
       last_failed_at = NOW()`,
    [identifier]
  );
}

export async function recordLoginFailure(email: string, ip: string): Promise<void> {
  await Promise.all([bumpFailure(`email:${email}`), bumpFailure(`ip:${ip}`)]);
}

export async function clearLoginAttempts(email: string, ip: string): Promise<void> {
  await query('DELETE FROM login_attempts WHERE identifier IN (?, ?)', [`email:${email}`, `ip:${ip}`]);
}

// ─── Generic submission throttle (public forms) ───────────────────────────────

/**
 * Throttles anonymous form submissions by IP, reusing the login_attempts table.
 *
 * The public booking and contact endpoints are open to the internet with no
 * captcha, so without this a script can flood the database and the shop's inbox.
 * Returns true when the caller is over its allowance.
 */
export async function isSubmissionThrottled(
  formKey: string,
  ip: string,
  { max = 5, windowMinutes = 10 }: { max?: number; windowMinutes?: number } = {}
): Promise<boolean> {
  const identifier = `form:${formKey}:${ip}`.slice(0, 190);

  // Same left-to-right assignment order as bumpFailure(): `attempts` below is
  // already the value set on the line above it.
  await query(
    `INSERT INTO login_attempts (identifier, attempts, last_failed_at, locked_until)
       VALUES (?, 1, NOW(), NULL)
     ON DUPLICATE KEY UPDATE
       attempts = IF(last_failed_at < NOW() - INTERVAL ${windowMinutes} MINUTE, 1, attempts + 1),
       last_failed_at = NOW()`,
    [identifier]
  );

  const rows = (await query(
    'SELECT attempts FROM login_attempts WHERE identifier = ? LIMIT 1',
    [identifier]
  )) as any[];

  return Number(rows[0]?.attempts ?? 0) > max;
}

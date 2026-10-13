import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { createSessionToken, buildSessionCookieOptions } from '@/app/lib/admin/session';
import { hashPassword, verifyPassword } from '@/app/lib/admin/password';
import { checkLoginAllowed, clearLoginAttempts, clientIp, recordLoginFailure } from '@/app/lib/admin/rate-limit';

// Verified against this when no user matches, so an unknown email costs the same
// scrypt work as a real one and cannot be distinguished by response time. The
// salt and key lengths deliberately match a genuine hash (16 and 64 bytes).
const DUMMY_HASH =
  'scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA==$' +
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==';

// One message for "no such user", "wrong password" and "inactive account" so the
// response cannot be used to enumerate which staff emails exist.
const GENERIC_ERROR = 'Invalid email or password.';

export const runtime = 'nodejs';

function isDatabaseError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const code = 'code' in error ? String(error.code) : '';
  return (
    ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'PROTOCOL_CONNECTION_LOST', 'ER_NO_SUCH_TABLE', 'ER_BAD_FIELD_ERROR'].includes(code) ||
    error.message.includes('DATABASE_URL')
  );
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  let email = '';
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  try {
    const credentials = body as { email?: unknown; password?: unknown } | null;
    email = typeof credentials?.email === 'string' ? credentials.email.toLowerCase().trim() : '';
    const password = typeof credentials?.password === 'string' ? credentials.password : '';

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required.' }, { status: 400 });
    }

    const lock = await checkLoginAllowed(email, ip);
    if (lock.locked) {
      const minutes = Math.ceil(lock.retryAfterSec / 60);
      return NextResponse.json(
        { error: `Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.` },
        { status: 429, headers: { 'Retry-After': String(lock.retryAfterSec) } }
      );
    }

    const rows = (await query(
      'SELECT id, name, email, role, password_hash, status, token_version FROM users WHERE email = ? LIMIT 1',
      [email]
    )) as any[];

    const user = rows[0];

    // Always run a verification, even with no matching user, so the response
    // time does not reveal whether the email exists.
    const { valid, needsRehash } = await verifyPassword(password, user?.password_hash ?? DUMMY_HASH);

    if (!user || !valid || user.status !== 'active') {
      await recordLoginFailure(email, ip);
      return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 });
    }

    // Upgrade legacy unsalted hashes now that we have the plaintext in hand.
    if (needsRehash) {
      try {
        await query('UPDATE users SET password_hash = ? WHERE id = ?', [await hashPassword(password), user.id]);
      } catch (e) {
        console.error('[admin/auth/login] password rehash failed', e);
      }
    }

    await Promise.all([
      clearLoginAttempts(email, ip),
      query('UPDATE users SET last_active = NOW() WHERE id = ?', [user.id]),
    ]);

    const token = createSessionToken({
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      ver: Number(user.token_version ?? 0),
    });

    const res = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });

    res.cookies.set(buildSessionCookieOptions(token));
    return res;
  } catch (err: unknown) {
    console.error('[admin/auth/login]', err);
    if (isDatabaseError(err)) {
      return NextResponse.json(
        { error: 'Login service is temporarily unavailable.', code: 'DATABASE_UNAVAILABLE' },
        { status: 503, headers: { 'Cache-Control': 'no-store' } }
      );
    }
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

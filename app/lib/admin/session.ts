// app/lib/admin/session.ts
// Server-only — import from API routes and Server Components only.

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import {
  SESSION_COOKIE,
  SESSION_DURATION_SEC,
  ROLES,
  createSessionToken,
  verifySessionToken,
  buildSessionCookieOptions,
  buildClearedSessionCookie,
  safeEqual,
  type Role,
  type SessionData,
} from './session-token';

export {
  SESSION_COOKIE,
  SESSION_DURATION_SEC,
  ROLES,
  createSessionToken,
  verifySessionToken,
  buildSessionCookieOptions,
  buildClearedSessionCookie,
  safeEqual,
};
export type { Role, SessionData };

/**
 * Reads and verifies the session cookie signature only.
 *
 * Prefer `requireSession()` in API routes: this does NOT confirm the user still
 * exists, is still active, or still holds the role baked into the cookie.
 */
export async function getSessionFromCookie(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

function unauthorized(message = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 });
}

function forbidden(message = 'Permission denied.') {
  return NextResponse.json({ error: message }, { status: 403 });
}

export type SessionResult =
  | { session: SessionData; error: null }
  | { session: null; error: NextResponse };

/**
 * Requires an authenticated, still-active user.
 *
 * The cookie is only the claim — the user row is re-read on every call so that
 * deactivating a user, changing their role, or bumping their token_version
 * takes effect immediately instead of waiting out the 7-day cookie. The
 * returned session always carries the role from the database, never the cookie.
 */
export async function requireSession(): Promise<SessionResult> {
  const claim = await getSessionFromCookie();
  if (!claim) return { session: null, error: unauthorized() };

  const rows = (await query(
    'SELECT id, name, email, role, status, token_version FROM users WHERE id = ? LIMIT 1',
    [claim.userId]
  )) as any[];

  const user = rows[0];
  if (!user) return { session: null, error: unauthorized('Session no longer valid.') };
  if (user.status !== 'active') return { session: null, error: forbidden('Account is inactive.') };
  if (Number(user.token_version ?? 0) !== claim.ver) {
    return { session: null, error: unauthorized('Session expired. Please sign in again.') };
  }

  return {
    session: {
      userId: user.id,
      role: user.role as Role,
      name: user.name,
      email: user.email,
      ver: Number(user.token_version ?? 0),
      exp: claim.exp,
    },
    error: null,
  };
}

/**
 * Requires an authenticated user holding one of `roles`.
 *
 * @example const { session, error } = await requireRole('admin', 'manager');
 *          if (error) return error;
 */
export async function requireRole(...roles: Role[]): Promise<SessionResult> {
  const result = await requireSession();
  if (result.error) return result;
  if (!roles.includes(result.session.role)) {
    return { session: null, error: forbidden(`Requires ${roles.join(' or ')} access.`) };
  }
  return result;
}

// app/lib/admin/session-token.ts
// Pure crypto — NO database and NO next/headers imports.
//
// This module is deliberately dependency-free so `proxy.ts` can import it to do
// a cheap, cookie-only "optimistic" auth check without pulling mysql2 into the
// proxy bundle. Real authorization always happens again inside each API route
// (see session.ts `requireSession` / `requireRole`), which re-reads the user row.

import { createHmac, timingSafeEqual } from 'crypto';

export const SESSION_COOKIE = 'darshana_session';
export const SESSION_DURATION_SEC = 60 * 60 * 24 * 7; // 7 days

export type Role = 'admin' | 'manager' | 'staff';
export const ROLES: readonly Role[] = ['admin', 'manager', 'staff'] as const;

export interface SessionData {
  userId: string;
  role: Role;
  name: string;
  email: string;
  /** Mirrors users.token_version — bumped to revoke every existing session for a user. */
  ver: number;
  exp: number;
}

function sessionSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error('[session] SESSION_SECRET env variable is not set.');
  if (s.length < 32) {
    throw new Error('[session] SESSION_SECRET must be at least 32 characters. Generate one with: openssl rand -hex 32');
  }
  return s;
}

/** Constant-time string compare that never throws on length mismatch. */
export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  // timingSafeEqual requires equal lengths, so compare digests of the inputs
  // instead — this keeps the comparison constant-time regardless of length.
  const ah = createHmac('sha256', 'cmp').update(ab).digest();
  const bh = createHmac('sha256', 'cmp').update(bb).digest();
  return timingSafeEqual(ah, bh);
}

export function createSessionToken(data: Omit<SessionData, 'exp'>): string {
  const payload: SessionData = {
    ...data,
    exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_SEC,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = createHmac('sha256', sessionSecret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

/**
 * Verifies the cookie signature and expiry. Does NOT check that the user still
 * exists, is still active, or still holds the role baked into the token —
 * `requireSession()` does that against the database.
 */
export function verifySessionToken(token: string | undefined | null): SessionData | null {
  if (!token) return null;

  // Resolved outside the try: a missing or too-short SESSION_SECRET is a
  // deployment fault and must surface as an error. Swallowing it here would
  // silently invalidate every session and look like a mass logout instead.
  const key = sessionSecret();

  try {
    const dot = token.lastIndexOf('.');
    if (dot === -1) return null;
    const body = token.slice(0, dot);
    const sig = token.slice(dot + 1);

    const expected = createHmac('sha256', key).update(body).digest('base64url');
    if (!safeEqual(sig, expected)) return null;

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SessionData;
    if (typeof payload.exp !== 'number' || payload.exp < Date.now() / 1000) return null;
    if (!payload.userId || !ROLES.includes(payload.role)) return null;
    // Sessions issued before token versioning existed have no `ver` and are rejected.
    if (typeof payload.ver !== 'number') return null;

    return payload;
  } catch {
    return null;
  }
}

export function buildSessionCookieOptions(token: string) {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_DURATION_SEC,
  };
}

export function buildClearedSessionCookie() {
  return { ...buildSessionCookieOptions(''), maxAge: 0 };
}

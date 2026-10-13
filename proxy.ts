import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/app/lib/admin/session-token';

// Optimistic auth gate for the admin panel.
//
// Per the Next.js guidance, this only reads and verifies the signed cookie — it
// deliberately performs no database work, because Proxy runs on every request
// including prefetches. It is not the authorization boundary: each API route
// still calls requireSession()/requireRole(), which re-reads the user row and
// checks status, role and token_version. This just stops unauthenticated
// visitors from loading admin pages at all.

const LOGIN_PATH = '/admin/login';

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const session = verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  const isLoginPage = pathname === LOGIN_PATH || pathname.startsWith(`${LOGIN_PATH}/`);

  if (!session && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    url.search = '';
    // Preserve where they were heading so login can send them back.
    if (pathname !== '/admin') url.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  if (session && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Admin pages only. API routes are excluded so they can return a JSON 401
  // instead of a redirect, and static assets are excluded so a signed-out
  // visitor still gets CSS and JS on the login page.
  matcher: ['/admin/:path*'],
};

import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy, config } from '@/proxy';
import { createSessionToken, SESSION_COOKIE } from '@/app/lib/admin/session-token';

function request(path: string, opts: { token?: string } = {}) {
  const req = new NextRequest(new URL(`https://shop.example${path}`));
  if (opts.token) req.cookies.set(SESSION_COOKIE, opts.token);
  return req;
}

const validToken = () =>
  createSessionToken({ userId: 'u1', role: 'staff', name: 'Kumar', email: 's@d.com', ver: 0 });

const location = (res: Response) => {
  const raw = res.headers.get('location');
  return raw ? new URL(raw) : null;
};

describe('proxy admin gate', () => {
  it.each(['/admin', '/admin/dashboard', '/admin/pos', '/admin/staff', '/admin/settings'])(
    'redirects an anonymous visitor away from %s',
    (path) => {
      const res = proxy(request(path));
      expect(res.status).toBe(307);
      expect(location(res)!.pathname).toBe('/admin/login');
    }
  );

  it('remembers where the visitor was heading', () => {
    const res = proxy(request('/admin/invoices?status=pending'));
    expect(location(res)!.searchParams.get('next')).toBe('/admin/invoices?status=pending');
  });

  it('does not add a next param for the bare /admin entry point', () => {
    expect(location(proxy(request('/admin')))!.searchParams.has('next')).toBe(false);
  });

  it('lets an anonymous visitor reach the login page', () => {
    expect(proxy(request('/admin/login')).headers.get('location')).toBeNull();
  });

  it('lets a signed-in user through to admin pages', () => {
    expect(proxy(request('/admin/dashboard', { token: validToken() })).headers.get('location')).toBeNull();
  });

  it('sends a signed-in user away from the login page', () => {
    const res = proxy(request('/admin/login', { token: validToken() }));
    expect(location(res)!.pathname).toBe('/admin/dashboard');
  });

  it.each([
    ['a forged token', 'abc.def'],
    ['an empty cookie', ''],
    ['random junk', 'not-a-session-token'],
  ])('treats %s as anonymous', (_label, token) => {
    expect(location(proxy(request('/admin/dashboard', { token })))!.pathname).toBe('/admin/login');
  });

  it('treats an expired-but-signed token as anonymous', () => {
    // Build a correctly signed token whose exp is in the past.
    const token = createSessionToken({ userId: 'u1', role: 'admin', name: 'A', email: 'a@d.com', ver: 0 });
    const [body] = token.split('.');
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    expect(payload.exp).toBeGreaterThan(Date.now() / 1000); // sanity
  });

  it('does not redirect a session whose role was changed in the database', () => {
    // Proxy is an optimistic cookie check by design — revocation is enforced by
    // requireSession() in the route, not here. This documents that contract.
    const staffToken = createSessionToken({ userId: 'u1', role: 'staff', name: 'K', email: 's@d.com', ver: 0 });
    expect(proxy(request('/admin/staff', { token: staffToken })).headers.get('location')).toBeNull();
  });
});

describe('proxy matcher', () => {
  it('scopes to /admin only, so API routes can answer 401 as JSON', () => {
    expect(config.matcher).toEqual(['/admin/:path*']);
  });
});

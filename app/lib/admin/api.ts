'use client';

// Typed mutation helpers for admin API routes.
// These fire a fetch request and return the parsed JSON response (or throw on error).

let redirectingToLogin = false;

/** Clears a rejected session once and returns the operator to a clean login page. */
export async function handleAdminUnauthorized(): Promise<void> {
  if (redirectingToLogin || typeof window === 'undefined') return;
  redirectingToLogin = true;
  await fetch('/api/admin/auth/logout', { method: 'POST' }).catch(() => {});
  const next = `${window.location.pathname}${window.location.search}`;
  const target = new URL('/admin/login', window.location.origin);
  if (!next.startsWith('/admin/login')) target.searchParams.set('next', next);
  target.searchParams.set('reason', 'session-expired');
  window.location.replace(target.toString());
}

/**
 * Parses a response body, tolerating non-JSON replies.
 *
 * A gateway timeout or crashed route returns an HTML error page, and calling
 * res.json() on that threw an opaque "Unexpected token <" parse error instead of
 * something the operator could act on.
 */
async function parseResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // Body was not JSON — fall through to the status-based message below.
  }

  if (!res.ok) {
    if (res.status === 401) {
      await handleAdminUnauthorized();
      throw new Error(json?.error ?? 'Your session has expired. Please sign in again.');
    }
    throw new Error(json?.error ?? `Request failed (HTTP ${res.status}).`);
  }
  if (json === null) throw new Error('The server returned an unreadable response.');
  return json as T;
}

export async function adminPost<T = any>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parseResponse<T>(res);
}

export async function adminPut<T = any>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parseResponse<T>(res);
}

export async function adminDelete<T = any>(url: string): Promise<T> {
  const res = await fetch(url, { method: 'DELETE' });
  return parseResponse<T>(res);
}

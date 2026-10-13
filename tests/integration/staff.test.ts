import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createSessionToken } from '@/app/lib/admin/session-token';
import { verifyPassword } from '@/app/lib/admin/password';

const state = vi.hoisted(() => ({
  cookie: undefined as string | undefined,
  users: [] as any[],
  actor: 'usr-admin',
  writes: [] as { sql: string; params: any[] }[],
}));

vi.mock('next/headers', () => ({
  cookies: async () => ({ get: (name: string) => (state.cookie ? { name, value: state.cookie } : undefined) }),
}));

vi.mock('@/app/lib/db', () => ({
  query: vi.fn(async (sql: string, params: any[] = []) => {
    if (/FROM users WHERE id/.test(sql)) {
      const found = state.users.filter((u) => u.id === params[0]);
      return found;
    }
    if (/FROM users WHERE email/.test(sql)) return state.users.filter((u) => u.email === params[0]);
    if (/COUNT\(\*\) AS count FROM users WHERE role='admin'/.test(sql)) {
      return [{ count: state.users.filter((u) => u.role === 'admin' && u.status === 'active').length }];
    }
    if (/^UPDATE users/.test(sql.trim())) { state.writes.push({ sql, params }); return {}; }
    if (/^INSERT INTO users/.test(sql.trim())) { state.writes.push({ sql, params }); return {}; }
    if (/INSERT INTO audit_logs/.test(sql)) { state.writes.push({ sql, params }); return {}; }
    if (/FROM users ORDER BY/.test(sql)) return state.users;
    return [];
  }),
  withTransaction: vi.fn(),
  getDbPool: vi.fn(),
}));

const staff = await import('@/app/api/admin/staff/route');

const asAdmin = () => {
  state.cookie = createSessionToken({
    userId: state.actor, role: 'admin', name: 'Boss', email: 'admin@darshana.com', ver: 0,
  });
};

const post = (body: unknown) =>
  staff.POST(new Request('http://localhost/api/admin/staff', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  }));

const put = (body: unknown) =>
  staff.PUT(new Request('http://localhost/api/admin/staff', {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  }));

const lastUserUpdate = () => state.writes.filter((w) => /^UPDATE users/.test(w.sql.trim())).at(-1);

beforeEach(() => {
  state.actor = 'usr-admin';
  state.users = [
    { id: 'usr-admin', name: 'Boss', email: 'admin@darshana.com', role: 'admin', status: 'active', token_version: 0 },
    { id: 'usr-2', name: 'Arun', email: 'manager@darshana.com', role: 'manager', status: 'active', token_version: 0 },
    { id: 'usr-3', name: 'Kumar', email: 'staff@darshana.com', role: 'staff', status: 'active', token_version: 0 },
  ];
  state.writes = [];
  asAdmin();
});

describe('creating staff', () => {
  const body = (over = {}) => ({ name: 'New Hire', email: 'new@darshana.com', password: 'abcd123456', role: 'staff', phone: '', ...over });

  it('creates an account and stores a scrypt hash, never the plaintext', async () => {
    const res = await post(body());
    expect(res.status).toBe(201);
    const insert = state.writes.find((w) => /INSERT INTO users/.test(w.sql))!;
    const hash = insert.params[3];
    expect(hash.startsWith('scrypt$')).toBe(true);
    expect(insert.params).not.toContain('abcd123456');
    expect((await verifyPassword('abcd123456', hash)).valid).toBe(true);
  });

  it('rejects a duplicate email with 409 rather than a database crash', async () => {
    const res = await post(body({ email: 'manager@darshana.com' }));
    expect(res.status).toBe(409);
    expect((await res.json()).error).toMatch(/already exists/i);
  });

  it.each(['owner', 'superadmin', 'ADMIN'])('rejects the invented role %s', async (role) => {
    expect((await post(body({ role }))).status).toBe(400);
  });

  it.each(['short1', 'alphabetsonly', '1234567890'])('rejects the weak password %s', async (password) => {
    const res = await post(body({ password }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/password/i);
  });

  it('normalises the email to lowercase', async () => {
    await post(body({ email: 'MiXeD@Darshana.com' }));
    expect(state.writes.find((w) => /INSERT INTO users/.test(w.sql))!.params[2]).toBe('mixed@darshana.com');
  });
});

describe('self-lockout protection', () => {
  it('stops an admin demoting themselves', async () => {
    const res = await put({ id: 'usr-admin', name: 'Boss', role: 'staff', status: 'active', password: '' });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/your own role/i);
  });

  it('stops an admin deactivating themselves', async () => {
    expect((await put({ id: 'usr-admin', name: 'Boss', role: 'admin', status: 'inactive', password: '' })).status).toBe(400);
  });

  it('allows an admin to rename themselves', async () => {
    expect((await put({ id: 'usr-admin', name: 'Boss Renamed', role: 'admin', status: 'active', password: '' })).status).toBe(200);
  });
});

describe('last-admin protection', () => {
  beforeEach(() => {
    // Two admins, and the actor is a different one so self-lockout isn't what trips.
    state.users = [
      { id: 'usr-admin', name: 'Boss', email: 'admin@darshana.com', role: 'admin', status: 'active', token_version: 0 },
      { id: 'usr-2', name: 'Second', email: 'second@darshana.com', role: 'admin', status: 'active', token_version: 0 },
    ];
    asAdmin();
  });

  it('allows demoting one admin while another remains', async () => {
    expect((await put({ id: 'usr-2', name: 'Second', role: 'staff', status: 'active', password: '' })).status).toBe(200);
  });

  it('refuses to demote the final active admin', async () => {
    state.users[1].role = 'staff'; // only usr-admin is an admin now
    state.actor = 'usr-2';
    state.cookie = createSessionToken({ userId: 'usr-2', role: 'admin', name: 'S', email: 's@d.com', ver: 0 });
    state.users[1].role = 'admin';
    state.users[0].status = 'inactive'; // leaves usr-2 as the only active admin
    const res = await put({ id: 'usr-2', name: 'Second', role: 'staff', status: 'active', password: '' });
    expect(res.status).toBe(400);
  });
});

describe('session revocation on change', () => {
  const bumped = () => /token_version = token_version \+ 1/.test(lastUserUpdate()!.sql);

  it('revokes sessions when the password changes', async () => {
    await put({ id: 'usr-3', name: 'Kumar', role: 'staff', status: 'active', password: 'newpass12345' });
    expect(bumped()).toBe(true);
  });

  it('revokes sessions when the role changes', async () => {
    await put({ id: 'usr-3', name: 'Kumar', role: 'manager', status: 'active', password: '' });
    expect(bumped()).toBe(true);
  });

  it('revokes sessions when the account is deactivated', async () => {
    await put({ id: 'usr-3', name: 'Kumar', role: 'staff', status: 'inactive', password: '' });
    expect(bumped()).toBe(true);
  });

  it('does NOT revoke sessions for a harmless rename', async () => {
    // Bumping here would sign the user out mid-shift for a typo fix.
    await put({ id: 'usr-3', name: 'Kumar M', role: 'staff', status: 'active', password: '' });
    expect(bumped()).toBe(false);
  });
});

describe('editing with a blank password', () => {
  it('leaves the stored password untouched', async () => {
    // Regression guard: the form always submits password:'' meaning "unchanged".
    const res = await put({ id: 'usr-3', name: 'Kumar', role: 'staff', status: 'active', password: '' });
    expect(res.status).toBe(200);
    expect(lastUserUpdate()!.sql).not.toMatch(/password_hash/);
  });

  it('still enforces strength when a real password is supplied', async () => {
    expect((await put({ id: 'usr-3', name: 'Kumar', role: 'staff', status: 'active', password: 'weak' })).status).toBe(400);
  });

  it('hashes a supplied password before storing it', async () => {
    await put({ id: 'usr-3', name: 'Kumar', role: 'staff', status: 'active', password: 'brandnew12345' });
    const update = lastUserUpdate()!;
    expect(update.sql).toMatch(/password_hash/);
    expect(update.params.some((p) => typeof p === 'string' && p.startsWith('scrypt$'))).toBe(true);
    expect(update.params).not.toContain('brandnew12345');
  });
});

describe('listing staff', () => {
  it('never returns password hashes', async () => {
    const res = await staff.GET();
    const body = await res.json();
    expect(JSON.stringify(body)).not.toMatch(/password/i);
  });

  it('returns 404 when editing a user that does not exist', async () => {
    expect((await put({ id: 'nope', name: 'X', role: 'staff', status: 'active', password: '' })).status).toBe(404);
  });
});

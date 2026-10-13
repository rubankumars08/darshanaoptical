import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createSessionToken, type Role } from '@/app/lib/admin/session-token';

const state = vi.hoisted(() => ({
  cookie: undefined as string | undefined,
  user: null as any,
  suppliers: [] as any[],
  writes: [] as { sql: string; params: any[] }[],
}));

vi.mock('next/headers', () => ({
  cookies: async () => ({ get: (name: string) => (state.cookie ? { name, value: state.cookie } : undefined) }),
}));

vi.mock('@/app/lib/db', () => ({
  query: vi.fn(async (sql: string, params: any[] = []) => {
    if (/FROM users WHERE id/.test(sql)) return state.user ? [state.user] : [];
    if (/FROM suppliers WHERE id/.test(sql)) return state.suppliers.filter((s) => s.id === params[0]);
    if (/^UPDATE suppliers/.test(sql.trim())) { state.writes.push({ sql, params }); return {}; }
    if (/^INSERT INTO suppliers/.test(sql.trim())) { state.writes.push({ sql, params }); return {}; }
    if (/INSERT INTO audit_logs/.test(sql)) { state.writes.push({ sql, params }); return {}; }
    if (/FROM suppliers/.test(sql)) return state.suppliers;
    return [];
  }),
  withTransaction: vi.fn(),
  getDbPool: vi.fn(),
}));

const collection = await import('@/app/api/admin/suppliers/route');
const byId = await import('@/app/api/admin/suppliers/[id]/route');

function signInAs(role: Role) {
  state.user = { id: 'u1', name: 'Manager', email: `${role}@d.com`, role, status: 'active', token_version: 0 };
  state.cookie = createSessionToken({ userId: 'u1', role, name: 'Manager', email: `${role}@d.com`, ver: 0 });
}

const put = (body: unknown, id = 'sup-1') =>
  byId.PUT(
    new Request(`http://localhost/api/admin/suppliers/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id }) }
  );

const post = (body: unknown) =>
  collection.POST(new Request('http://localhost/api/admin/suppliers', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  }));

const lastUpdate = () => state.writes.filter((w) => /^UPDATE suppliers/.test(w.sql.trim())).at(-1);

/** Exactly what the page sends: setForm({ ...s }) on the whole supplier row. */
const rowBody = (over: Record<string, unknown> = {}) => ({
  id: 'sup-1', name: 'Lens House', contact_person: 'Suresh', phone: '9000000000',
  email: 'lens@house.com', address: 'Salem', gst: '33ABCDE1234F1Z5',
  balance: 12500, status: 'active',
  created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-02T00:00:00.000Z',
  ...over,
});

beforeEach(() => {
  state.suppliers = [{
    id: 'sup-1', name: 'Lens House', contact_person: 'Suresh', phone: '9000000000',
    email: 'lens@house.com', address: 'Salem', gst: '33ABCDE1234F1Z5',
    balance: 12500, status: 'active',
  }];
  state.writes = [];
  signInAs('manager');
});

describe('supplier edit (the route the page has always called)', () => {
  it('saves an edit instead of returning 404', async () => {
    const res = await put(rowBody({ name: 'Lens House Pvt Ltd' }));
    expect(res.status).toBe(200);
    expect(lastUpdate()!.params[0]).toBe('Lens House Pvt Ltd');
  });

  it('accepts the full row the edit dialog spreads', async () => {
    expect((await put(rowBody())).status).toBe(200);
  });

  it('returns 404 for a supplier that does not exist', async () => {
    expect((await put(rowBody(), 'nope')).status).toBe(404);
  });

  it('writes an audit entry', async () => {
    await put(rowBody({ name: 'Renamed' }));
    const audit = state.writes.find((w) => /audit_logs/.test(w.sql))!;
    expect(audit.params).toContain('supplier');
    expect(audit.params.some((p) => typeof p === 'string' && p.includes('Renamed'))).toBe(true);
  });

  it('leaves fields the form omitted unchanged', async () => {
    await put({ name: 'Only Name Changed' });
    const params = lastUpdate()!.params;
    expect(params[0]).toBe('Only Name Changed');
    expect(params[2]).toBe('9000000000'); // phone preserved from the stored row
  });
});

describe('balance is not client-writable', () => {
  it('ignores a balance sent in the edit body', async () => {
    // A manager must not be able to erase what the shop owes by editing the
    // supplier; balance is maintained by the purchases flow.
    await put(rowBody({ balance: 0 }));
    const update = lastUpdate()!;
    expect(update.sql).not.toMatch(/balance/);
    expect(update.params).not.toContain(0);
  });

  it('never carries a client balance into the statement', async () => {
    await put(rowBody({ balance: 999999 }));
    const update = lastUpdate()!;
    expect(update.params).not.toContain(999999);
    // Nor the stored value — balance is absent from the SET list entirely.
    expect(update.params).not.toContain(12500);
  });

  it('does not let the id be rewritten', async () => {
    await put(rowBody({ id: 'other-supplier' }));
    // The id used in the WHERE clause is the last parameter, from the URL.
    expect(lastUpdate()!.params.at(-1)).toBe('sup-1');
  });
});

describe('validation', () => {
  it('rejects a blank name', async () => {
    expect((await put(rowBody({ name: '' }))).status).toBe(400);
  });

  it('rejects a malformed email', async () => {
    expect((await put(rowBody({ email: 'not-an-email' }))).status).toBe(400);
  });

  it('accepts an empty email from a cleared field', async () => {
    expect((await put(rowBody({ email: '' }))).status).toBe(200);
  });

  it('rejects an unknown status', async () => {
    expect((await put(rowBody({ status: 'deleted' }))).status).toBe(400);
  });

  it('allows deactivating a supplier', async () => {
    await put(rowBody({ status: 'inactive' }));
    expect(lastUpdate()!.params).toContain('inactive');
  });
});

describe('permissions', () => {
  it('denies staff', async () => {
    signInAs('staff');
    expect((await put(rowBody())).status).toBe(403);
  });

  it('allows admin and manager', async () => {
    signInAs('admin');
    expect((await put(rowBody())).status).toBe(200);
    signInAs('manager');
    expect((await put(rowBody())).status).toBe(200);
  });

  it('rejects an anonymous request', async () => {
    state.cookie = undefined;
    state.user = null;
    expect((await put(rowBody())).status).toBe(401);
  });
});

describe('supplier creation still works', () => {
  const form = (over = {}) => ({
    name: 'New Supplier', contact_person: '', phone: '9111111111',
    email: '', address: '', gst: '', status: 'active', ...over,
  });

  it('accepts the add form body', async () => {
    expect((await post(form())).status).toBe(201);
  });

  it.each([
    ['missing name', { name: '' }],
    ['missing phone', { phone: '' }],
    ['bad email', { email: 'nope' }],
  ])('rejects %s', async (_label, over) => {
    expect((await post(form(over))).status).toBe(400);
  });
});

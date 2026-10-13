import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createSessionToken, type Role } from '@/app/lib/admin/session-token';

const state = vi.hoisted(() => ({
  cookie: undefined as string | undefined,
  user: null as any,
  appointments: [] as any[],
  inquiries: [] as any[],
  writes: [] as { sql: string; params: any[] }[],
}));

vi.mock('next/headers', () => ({
  cookies: async () => ({ get: (name: string) => (state.cookie ? { name, value: state.cookie } : undefined) }),
}));

vi.mock('@/app/lib/db', () => ({
  query: vi.fn(async (sql: string, params: any[] = []) => {
    if (/FROM users WHERE id/.test(sql)) return state.user ? [state.user] : [];
    if (/FROM appointments WHERE id/.test(sql)) return state.appointments.filter((a) => a.id === params[0]);
    if (/FROM inquiries WHERE id/.test(sql)) return state.inquiries.filter((i) => i.id === params[0]);
    if (/FROM appointments/.test(sql)) return state.appointments;
    if (/FROM inquiries/.test(sql)) return state.inquiries;
    if (/^UPDATE (appointments|inquiries)/.test(sql.trim())) { state.writes.push({ sql, params }); return {}; }
    if (/INSERT INTO audit_logs/.test(sql)) { state.writes.push({ sql, params }); return {}; }
    return [];
  }),
  withTransaction: vi.fn(),
  getDbPool: vi.fn(),
}));

const bookings = await import('@/app/api/admin/bookings/route');

function signInAs(role: Role) {
  state.user = { id: 'u1', name: 'Kumar', email: `${role}@d.com`, role, status: 'active', token_version: 0 };
  state.cookie = createSessionToken({ userId: 'u1', role, name: 'Kumar', email: `${role}@d.com`, ver: 0 });
}

const get = (qs = '') => bookings.GET(new Request(`http://localhost/api/admin/bookings${qs}`));
const put = (body: unknown) =>
  bookings.PUT(new Request('http://localhost/api/admin/bookings', {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  }));

const lastUpdate = () => state.writes.filter((w) => /^UPDATE/.test(w.sql.trim())).at(-1);

beforeEach(() => {
  state.appointments = [
    { id: 1, name: 'Ravi', phone: '9000000000', email: 'r@x.com', test_type: 'Eye Testing', status: 'pending' },
    { id: 2, name: 'Meena', phone: '9111111111', email: null, test_type: 'Eye Testing', status: 'confirmed' },
  ];
  state.inquiries = [{ id: 5, name: 'Suresh', phone: '9222222222', interest: 'Frames', status: 'new' }];
  state.writes = [];
  signInAs('staff');
});

describe('website bookings are visible in the admin panel', () => {
  it('returns both appointments and enquiries', async () => {
    const body = await (await get()).json();
    expect(body.appointments).toHaveLength(2);
    expect(body.inquiries).toHaveLength(1);
  });

  it('is readable by counter staff, who answer the phone', async () => {
    signInAs('staff');
    expect((await get()).status).toBe(200);
  });

  it('rejects an anonymous request', async () => {
    state.cookie = undefined; state.user = null;
    expect((await get()).status).toBe(401);
  });
});

describe('updating a booking status', () => {
  it('confirms an appointment', async () => {
    const res = await put({ kind: 'appointment', id: 1, status: 'confirmed' });
    expect(res.status).toBe(200);
    expect(lastUpdate()!.sql).toMatch(/UPDATE appointments/);
    expect(lastUpdate()!.params[0]).toBe('confirmed');
  });

  it('marks an enquiry contacted', async () => {
    const res = await put({ kind: 'inquiry', id: 5, status: 'contacted' });
    expect(res.status).toBe(200);
    expect(lastUpdate()!.sql).toMatch(/UPDATE inquiries/);
  });

  it('writes an audit entry', async () => {
    await put({ kind: 'appointment', id: 1, status: 'completed' });
    expect(state.writes.some((w) => /audit_logs/.test(w.sql))).toBe(true);
  });

  it('returns 404 for an unknown id', async () => {
    expect((await put({ kind: 'appointment', id: 999, status: 'confirmed' })).status).toBe(404);
  });
});

describe('the two status vocabularies stay separate', () => {
  it('refuses an enquiry status on an appointment', async () => {
    // 'contacted' is not in the appointments ENUM; without this guard the
    // database would reject it at the driver level instead.
    const res = await put({ kind: 'appointment', id: 1, status: 'contacted' });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/not valid for a appointment/i);
  });

  it('refuses an appointment status on an enquiry', async () => {
    expect((await put({ kind: 'inquiry', id: 5, status: 'confirmed' })).status).toBe(400);
  });

  it.each(['pending', 'confirmed', 'completed', 'cancelled'])('accepts appointment status %s', async (status) => {
    expect((await put({ kind: 'appointment', id: 1, status })).status).toBe(200);
  });

  it.each(['new', 'contacted', 'closed'])('accepts enquiry status %s', async (status) => {
    expect((await put({ kind: 'inquiry', id: 5, status })).status).toBe(200);
  });
});

describe('input validation', () => {
  it.each([
    ['unknown kind', { kind: 'order', id: 1, status: 'pending' }],
    ['invented status', { kind: 'appointment', id: 1, status: 'deleted' }],
    ['missing id', { kind: 'appointment', status: 'pending' }],
    ['non-numeric id', { kind: 'appointment', id: 'abc', status: 'pending' }],
    ['negative id', { kind: 'appointment', id: -3, status: 'pending' }],
    ['empty body', {}],
  ])('rejects %s', async (_label, body) => {
    expect((await put(body)).status).toBe(400);
  });

  it('never interpolates the table name from user input', async () => {
    await put({ kind: 'appointment', id: 1, status: 'confirmed' });
    // Table comes from a fixed mapping on `kind`, never the raw value.
    expect(lastUpdate()!.sql).toMatch(/^UPDATE appointments/);
  });
});

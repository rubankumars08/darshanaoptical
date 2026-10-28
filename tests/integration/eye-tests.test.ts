import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSessionToken, type Role } from '@/app/lib/admin/session-token';

const RECORD_ID = '3c21833a-7df9-4227-915f-97eef1cf9620';

const state = vi.hoisted(() => ({
  cookie: undefined as string | undefined,
  user: null as null | {
    id: string;
    name: string;
    email: string;
    role: Role;
    status: string;
    token_version: number;
  },
  eyeTests: [] as Array<Record<string, unknown>>,
  calls: [] as Array<{ sql: string; params: unknown[] }>,
}));

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === 'darshana_session' && state.cookie
        ? { name, value: state.cookie }
        : undefined,
  }),
}));

vi.mock('@/app/lib/db', () => ({
  query: vi.fn(async (sql: string, params: unknown[] = []) => {
    state.calls.push({ sql, params });
    if (/FROM users WHERE id/.test(sql)) return state.user ? [state.user] : [];
    if (/FROM eye_tests WHERE id =/.test(sql)) {
      return state.eyeTests.filter((test) => test.id === params[0]);
    }
    if (/FROM eye_tests WHERE 1=1/.test(sql)) return state.eyeTests;
    return [];
  }),
  withTransaction: vi.fn(),
  getDbPool: vi.fn(),
}));

const collection = await import('@/app/api/admin/eye-tests/route');
const detail = await import('@/app/api/admin/eye-tests/[id]/route');

function signInAs(role: Role | null) {
  if (!role) {
    state.cookie = undefined;
    state.user = null;
    return;
  }

  state.user = {
    id: 'user-1',
    name: 'Test Operator',
    email: `${role}@darshana.com`,
    role,
    status: 'active',
    token_version: 0,
  };
  state.cookie = createSessionToken({
    userId: 'user-1',
    name: 'Test Operator',
    email: `${role}@darshana.com`,
    role,
    ver: 0,
  });
}

const listRequest = (query = '') =>
  new Request(`http://localhost:3000/api/admin/eye-tests${query}`);

const detailRequest = (id = RECORD_ID) =>
  detail.GET(
    new Request(`http://localhost:3000/api/admin/eye-tests/${id}`),
    { params: Promise.resolve({ id }) }
  );

beforeEach(() => {
  state.calls = [];
  state.eyeTests = [{
    id: RECORD_ID,
    customer_id: 'customer-1',
    customer_name: 'Test Customer Kumar',
    customer_phone: '9944112233',
    test_date: '2026-09-11',
    tested_by: 'Dr. Sankar',
    re_sph: '-1.50',
    le_sph: '-1.25',
  }];
  signInAs(null);
});

describe('eye-test authentication flow', () => {
  it('returns 401 for both requests before login and never queries eye_tests', async () => {
    expect((await collection.GET(listRequest())).status).toBe(401);
    expect((await detailRequest()).status).toBe(401);
    expect(state.calls.some(({ sql }) => /FROM eye_tests/.test(sql))).toBe(false);
  });

  it.each<Role>(['admin', 'manager', 'staff'])('returns the list after %s login', async (role) => {
    signInAs(role);
    const response = await collection.GET(listRequest());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ eyeTests: state.eyeTests });
  });

  it.each<Role>(['admin', 'manager', 'staff'])('returns a prescription detail after %s login', async (role) => {
    signInAs(role);
    const response = await detailRequest();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ eyeTest: state.eyeTests[0] });
  });
});

describe('eye-test request behavior', () => {
  it('passes customer and search filters to the database query', async () => {
    signInAs('admin');
    await collection.GET(listRequest('?customerId=customer-1&q=Kumar'));

    const call = state.calls.find(({ sql }) => /FROM eye_tests WHERE 1=1/.test(sql));
    expect(call?.sql).toContain('customer_id = ?');
    expect(call?.sql).toContain('customer_name LIKE ? OR customer_phone LIKE ?');
    expect(call?.params).toEqual(['customer-1', '%Kumar%', '%Kumar%']);
  });

  it('returns 404 for an authenticated request with an unknown id', async () => {
    signInAs('admin');
    const response = await detailRequest('missing-eye-test');
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: 'Not found.' });
  });

  it('uses the plural collection route expected by the application', async () => {
    signInAs('admin');
    const response = await collection.GET(listRequest());
    expect(response.status).toBe(200);
    expect(new URL(listRequest().url).pathname).toBe('/api/admin/eye-tests');
  });
});

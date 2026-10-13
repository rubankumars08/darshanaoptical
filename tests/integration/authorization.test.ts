import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createSessionToken, SESSION_COOKIE, type Role } from '@/app/lib/admin/session-token';

// ─── Test doubles ─────────────────────────────────────────────────────────────

const state = vi.hoisted(() => ({
  cookie: undefined as string | undefined,
  user: null as null | { id: string; name: string; email: string; role: string; status: string; token_version: number },
}));

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (state.cookie !== undefined && name === 'darshana_session' ? { name, value: state.cookie } : undefined),
  }),
}));

vi.mock('@/app/lib/db', () => {
  const query = vi.fn(async (sql: string) => {
    // The lookup requireSession() performs on every request.
    if (/FROM users WHERE id/.test(sql)) return state.user ? [state.user] : [];
    if (/COUNT\(\*\) AS count FROM users/i.test(sql)) return [{ count: 2 }];
    if (/FROM shop_settings/.test(sql)) return [{ id: 1, max_discount_admin: 100, max_discount_manager: 15, max_discount_staff: 5 }];
    if (/COUNT\(\*\)/i.test(sql)) return [{ c: 0, cnt: 0, count: 0 }];
    return [];
  });
  const withTransaction = vi.fn(async (fn: any) => fn({ query: vi.fn(async () => []) }));
  return { query, withTransaction, getDbPool: vi.fn() };
});

// ─── Route handlers under test ────────────────────────────────────────────────

const audit = await import('@/app/api/admin/audit/route');
const bookings = await import('@/app/api/admin/bookings/route');
const me = await import('@/app/api/admin/auth/me/route');
const customers = await import('@/app/api/admin/customers/route');
const customerById = await import('@/app/api/admin/customers/[id]/route');
const dashboard = await import('@/app/api/admin/dashboard/route');
const expenses = await import('@/app/api/admin/expenses/route');
const expenseById = await import('@/app/api/admin/expenses/[id]/route');
const eyeTests = await import('@/app/api/admin/eye-tests/route');
const inventory = await import('@/app/api/admin/inventory/route');
const stockIn = await import('@/app/api/admin/inventory/stock-in/route');
const invoices = await import('@/app/api/admin/invoices/route');
const orders = await import('@/app/api/admin/orders/route');
const products = await import('@/app/api/admin/products/route');
const productById = await import('@/app/api/admin/products/[id]/route');
const purchases = await import('@/app/api/admin/purchases/route');
const settings = await import('@/app/api/admin/settings/route');
const staff = await import('@/app/api/admin/staff/route');
const suppliers = await import('@/app/api/admin/suppliers/route');
const supplierById = await import('@/app/api/admin/suppliers/[id]/route');
const upload = await import('@/app/api/admin/upload/route');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ALL_ROLES: Role[] = ['admin', 'manager', 'staff'];

function signInAs(role: Role | null, over: Partial<{ status: string; token_version: number }> = {}) {
  if (!role) {
    state.cookie = undefined;
    state.user = null;
    return;
  }
  state.user = {
    id: 'usr-1', name: 'Test User', email: `${role}@darshana.com`,
    role, status: over.status ?? 'active', token_version: over.token_version ?? 0,
  };
  state.cookie = createSessionToken({
    userId: 'usr-1', role, name: 'Test User', email: `${role}@darshana.com`, ver: 0,
  });
}

const req = (method: string, body?: unknown, url = 'http://localhost/api/admin/x') =>
  new Request(url, {
    method,
    ...(body === undefined ? {} : { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }),
  });

const params = (id = 'abc') => ({ params: Promise.resolve({ id }) });

/** Every guarded endpoint, with the roles that are supposed to reach it. */
const MATRIX: { name: string; allowed: Role[]; call: () => Promise<Response> }[] = [
  // Open to any signed-in user
  { name: 'GET /auth/me', allowed: ALL_ROLES, call: () => me.GET() },
  { name: 'GET /dashboard', allowed: ALL_ROLES, call: () => dashboard.GET() },
  { name: 'GET /inventory', allowed: ALL_ROLES, call: () => inventory.GET(req('GET')) },
  { name: 'POST /inventory/stock-in', allowed: ['admin', 'manager'], call: () => stockIn.POST(req('POST', {})) },
  { name: 'GET /orders', allowed: ALL_ROLES, call: () => orders.GET() },
  { name: 'GET /customers', allowed: ALL_ROLES, call: () => customers.GET(req('GET')) },
  { name: 'POST /customers', allowed: ALL_ROLES, call: () => customers.POST(req('POST', { name: 'A', phone: '1' })) },
  { name: 'GET /customers/[id]', allowed: ALL_ROLES, call: () => customerById.GET(req('GET'), params()) },
  { name: 'GET /eye-tests', allowed: ALL_ROLES, call: () => eyeTests.GET(req('GET')) },
  { name: 'POST /eye-tests', allowed: ALL_ROLES, call: () => eyeTests.POST(req('POST', { customer_id: 'c', test_date: '2026-01-01' })) },
  { name: 'GET /invoices', allowed: ALL_ROLES, call: () => invoices.GET(req('GET')) },
  { name: 'GET /products', allowed: ALL_ROLES, call: () => products.GET(req('GET')) },
  { name: 'GET /products/[id]', allowed: ALL_ROLES, call: () => productById.GET(req('GET'), params()) },
  { name: 'GET /settings', allowed: ALL_ROLES, call: () => settings.GET() },
  { name: 'GET /bookings', allowed: ALL_ROLES, call: () => bookings.GET(req('GET')) },
  { name: 'PUT /bookings', allowed: ALL_ROLES, call: () => bookings.PUT(req('PUT', {})) },

  // Management only
  { name: 'GET /audit', allowed: ['admin', 'manager'], call: () => audit.GET(req('GET')) },
  { name: 'GET /expenses', allowed: ['admin', 'manager'], call: () => expenses.GET(req('GET')) },
  { name: 'POST /expenses', allowed: ['admin', 'manager'], call: () => expenses.POST(req('POST', {})) },
  { name: 'DELETE /expenses/[id]', allowed: ['admin', 'manager'], call: () => expenseById.DELETE(req('DELETE'), params()) },
  { name: 'GET /purchases', allowed: ['admin', 'manager'], call: () => purchases.GET(req('GET')) },
  { name: 'POST /purchases', allowed: ['admin', 'manager'], call: () => purchases.POST(req('POST', {})) },
  { name: 'GET /suppliers', allowed: ['admin', 'manager'], call: () => suppliers.GET(req('GET')) },
  { name: 'POST /suppliers', allowed: ['admin', 'manager'], call: () => suppliers.POST(req('POST', {})) },
  { name: 'PUT /suppliers/[id]', allowed: ['admin', 'manager'], call: () => supplierById.PUT(req('PUT', {}), params()) },
  { name: 'POST /products', allowed: ['admin', 'manager'], call: () => products.POST(req('POST', {})) },
  { name: 'PUT /products/[id]', allowed: ['admin', 'manager'], call: () => productById.PUT(req('PUT', {}), params()) },
  { name: 'POST /upload', allowed: ['admin', 'manager'], call: () => upload.POST(req('POST', { dataUrl: 'x' })) },
  { name: 'DELETE /upload', allowed: ['admin', 'manager'], call: () => upload.DELETE(req('DELETE', undefined)) },

  // Admin only
  { name: 'DELETE /customers/[id]', allowed: ['admin'], call: () => customerById.DELETE(req('DELETE'), params()) },
  { name: 'DELETE /products/[id]', allowed: ['admin'], call: () => productById.DELETE(req('DELETE'), params()) },
  { name: 'PUT /settings', allowed: ['admin'], call: () => settings.PUT(req('PUT', {})) },
  { name: 'GET /staff', allowed: ['admin'], call: () => staff.GET() },
  { name: 'POST /staff', allowed: ['admin'], call: () => staff.POST(req('POST', {})) },
  { name: 'PUT /staff', allowed: ['admin'], call: () => staff.PUT(req('PUT', {})) },
];

beforeEach(() => signInAs(null));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('every admin endpoint requires authentication', () => {
  it.each(MATRIX)('$name rejects an anonymous request', async ({ call }) => {
    signInAs(null);
    expect((await call()).status).toBe(401);
  });
});

describe('role enforcement is on the server, not just the sidebar', () => {
  for (const entry of MATRIX) {
    for (const role of ALL_ROLES) {
      const permitted = entry.allowed.includes(role);
      it(`${entry.name} ${permitted ? 'allows' : 'denies'} ${role}`, async () => {
        signInAs(role);
        const status = (await entry.call()).status;
        if (permitted) {
          // The mocked database makes some handlers fail later on; all that
          // matters here is that authorization itself did not reject them.
          expect(status, `${entry.name} should not reject ${role}`).not.toBe(403);
          expect(status, `${entry.name} should not reject ${role}`).not.toBe(401);
        } else {
          expect(status, `${entry.name} must deny ${role}`).toBe(403);
        }
      });
    }
  }
});

describe('sessions are revocable through the database', () => {
  it('rejects a validly signed cookie for a user who no longer exists', async () => {
    signInAs('admin');
    state.user = null; // deleted from the users table
    expect((await me.GET()).status).toBe(401);
  });

  it('rejects a deactivated account even with a fresh cookie', async () => {
    signInAs('admin', { status: 'inactive' });
    expect((await me.GET()).status).toBe(403);
  });

  it('rejects a cookie whose token_version is stale', async () => {
    signInAs('admin');
    state.user!.token_version = 1; // bumped by a password or role change
    expect((await me.GET()).status).toBe(401);
  });

  it('uses the database role, not the role baked into the cookie', async () => {
    // Cookie claims admin; the row says staff. Staff must not reach /staff.
    signInAs('staff');
    state.cookie = createSessionToken({
      userId: 'usr-1', role: 'admin', name: 'Test User', email: 'staff@darshana.com', ver: 0,
    });
    expect((await staff.GET()).status).toBe(403);
  });
});

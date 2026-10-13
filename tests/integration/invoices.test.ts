import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createSessionToken, type Role } from '@/app/lib/admin/session-token';

const state = vi.hoisted(() => ({
  cookie: undefined as string | undefined,
  user: null as any,
  settings: { max_discount_admin: 100, max_discount_manager: 15, max_discount_staff: 5 },
  invoice: null as any,
  counters: new Map<string, number>(),
  txLog: [] as { sql: string; params: any[] }[],
  products: new Map<string, { stock: number; name: string }>(),
}));

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => (state.cookie !== undefined ? { name, value: state.cookie } : undefined),
  }),
}));

vi.mock('@/app/lib/db', () => {
  const runTxQuery = async (sql: string, params: any[] = []) => {
    state.txLog.push({ sql, params });
    if (/FROM counters/.test(sql)) return [{ value: state.counters.get(params[0]) ?? 0 }];
    if (/UPDATE counters/.test(sql)) { state.counters.set(params[1], params[0]); return {}; }
    if (/FROM products WHERE id = \? FOR UPDATE/.test(sql)) {
      const p = state.products.get(params[0]);
      return p ? [p] : [];
    }
    if (/FROM invoices WHERE id = \? FOR UPDATE/.test(sql)) return state.invoice ? [state.invoice] : [];
    if (/FROM invoice_items/.test(sql)) return state.invoice?.items ?? [];
    return [];
  };
  return {
    query: vi.fn(async (sql: string, params: any[] = []) => {
      if (/FROM users WHERE id/.test(sql)) return state.user ? [state.user] : [];
      if (/FROM shop_settings/.test(sql)) return [state.settings];
      if (/FROM invoices WHERE id/.test(sql)) return state.invoice ? [state.invoice] : [];
      if (/FROM invoice_items|FROM payments/.test(sql)) return [];
      return [];
    }),
    withTransaction: vi.fn(async (fn: any) => fn({ query: runTxQuery })),
    getDbPool: vi.fn(),
  };
});

const invoices = await import('@/app/api/admin/invoices/route');
const invoiceById = await import('@/app/api/admin/invoices/[id]/route');

function signInAs(role: Role) {
  state.user = { id: 'u1', name: 'Test', email: `${role}@d.com`, role, status: 'active', token_version: 0 };
  state.cookie = createSessionToken({ userId: 'u1', role, name: 'Test', email: `${role}@d.com`, ver: 0 });
}

const post = (body: unknown) =>
  invoices.POST(new Request('http://localhost/api/admin/invoices', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  }));

const put = (body: unknown, id = 'inv-1') =>
  invoiceById.PUT(
    new Request(`http://localhost/api/admin/invoices/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id }) }
  );

const sale = (over: Record<string, unknown> = {}) => ({
  customer_id: 'c1', customer_name: 'Ravi', customer_phone: '900',
  items: [{ product_id: 'p1', product_name: 'Aviator', product_code: 'FR-1', category: 'frame', quantity: 1, unit_price: 1000 }],
  ...over,
});

beforeEach(() => {
  state.counters = new Map([['invoice', 125]]);
  state.txLog = [];
  state.products = new Map([['p1', { stock: 50, name: 'Aviator' }]]);
  state.invoice = null;
  state.settings = { max_discount_admin: 100, max_discount_manager: 15, max_discount_staff: 5 };
  signInAs('admin');
});

describe('invoice numbering', () => {
  it('continues from the seeded counter rather than a row count', async () => {
    const res = await post(sale());
    expect(res.status).toBe(201);
    expect((await res.json()).invoice_number).toBe('DO-2026-00126');
  });

  it('reserves the number inside the transaction', async () => {
    await post(sale());
    // The counter read must be part of the transaction log, not a prior query.
    expect(state.txLog.some((q) => /FROM counters/.test(q.sql) && /FOR UPDATE/.test(q.sql))).toBe(true);
  });
});

describe('discount ceilings per role', () => {
  it('lets an admin apply a full discount', async () => {
    signInAs('admin');
    expect((await post(sale({ discount_percent: 100 }))).status).toBe(201);
  });

  it('allows a manager up to their cap', async () => {
    signInAs('manager');
    expect((await post(sale({ discount_percent: 15 }))).status).toBe(201);
  });

  it('blocks a manager above their cap', async () => {
    signInAs('manager');
    const res = await post(sale({ discount_percent: 40 }));
    expect(res.status).toBe(403);
    expect((await res.json()).error).toMatch(/exceeds the 15% limit/i);
  });

  it('allows staff up to their cap', async () => {
    signInAs('staff');
    expect((await post(sale({ discount_percent: 5 }))).status).toBe(201);
  });

  it('blocks staff above their cap', async () => {
    signInAs('staff');
    expect((await post(sale({ discount_percent: 6 }))).status).toBe(403);
  });

  it('cannot be bypassed by sending discount_amount directly', async () => {
    // The original hole: the cap was never read, and a raw amount skipped the
    // percentage entirely.
    signInAs('staff');
    const res = await post(sale({ discount_amount: 900 })); // 90% of 1000
    expect(res.status).toBe(403);
  });

  it('honours a cap changed in shop settings', async () => {
    state.settings.max_discount_staff = 25;
    signInAs('staff');
    expect((await post(sale({ discount_percent: 20 }))).status).toBe(201);
  });

  it('applies the most restrictive default when settings are missing', async () => {
    state.settings = {} as any;
    signInAs('staff');
    expect((await post(sale({ discount_percent: 10 }))).status).toBe(403);
  });
});

describe('discount arithmetic', () => {
  it('rejects a discount larger than the bill', async () => {
    const res = await post(sale({ discount_amount: 1500 }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/greater than the subtotal/i);
  });

  it('rejects a negative discount that would inflate the total', async () => {
    expect((await post(sale({ discount_amount: -500 }))).status).toBe(400);
  });

  it('allows a discount exactly equal to the subtotal', async () => {
    expect((await post(sale({ discount_amount: 1000 }))).status).toBe(201);
  });
});

describe('stock protection', () => {
  it('refuses to sell more than is in stock', async () => {
    state.products.set('p1', { stock: 2, name: 'Aviator' });
    const res = await post(sale({
      items: [{ product_id: 'p1', product_name: 'Aviator', product_code: 'FR-1', category: 'frame', quantity: 5, unit_price: 100 }],
    }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/insufficient stock/i);
  });

  it('does not check stock for service lines', async () => {
    const res = await post(sale({
      items: [{ product_id: 'svc', product_name: 'Fitting', product_code: 'SV-1', category: 'service', quantity: 1, unit_price: 100 }],
    }));
    expect(res.status).toBe(201);
  });
});

describe('payments on an existing invoice', () => {
  beforeEach(() => {
    state.invoice = { id: 'inv-1', invoice_number: 'DO-2026-00100', status: 'partially_paid', total: '1000.00', paid: '400.00', items: [] };
  });

  it('accepts a payment up to the outstanding balance', async () => {
    expect((await put({ add_payment: 600 })).status).toBe(200);
  });

  it('rejects an overpayment instead of silently clamping it', async () => {
    // Previously the invoice clamped to zero balance while the payments table
    // still recorded the full amount, inflating collection reports.
    const res = await put({ add_payment: 900 });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/exceeds the outstanding balance/i);
  });

  it('rejects a zero or negative payment at validation', async () => {
    expect((await put({ add_payment: 0 })).status).toBe(400);
    expect((await put({ add_payment: -50 })).status).toBe(400);
  });
});

describe('cancelled invoices', () => {
  beforeEach(() => {
    state.invoice = { id: 'inv-1', invoice_number: 'DO-2026-00100', status: 'cancelled', total: '1000.00', paid: '0.00', items: [] };
  });

  it('refuses further payments', async () => {
    const res = await put({ add_payment: 100 });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/cancelled/i);
  });

  it('refuses order-status changes', async () => {
    expect((await put({ order_status: 'ready' })).status).toBe(400);
  });
});

describe('cancelling an invoice', () => {
  beforeEach(() => {
    state.invoice = {
      id: 'inv-1', invoice_number: 'DO-2026-00100', status: 'partially_paid',
      total: '1000.00', paid: '400.00',
      items: [{ product_id: 'p1', product_name: 'Aviator', product_code: 'FR-1', category: 'frame', quantity: 2 }],
    };
  });

  it('is refused for staff', async () => {
    signInAs('staff');
    expect((await put({ cancel: true })).status).toBe(403);
  });

  it('is allowed for a manager', async () => {
    signInAs('manager');
    expect((await put({ cancel: true })).status).toBe(200);
  });

  it('writes an offsetting refund so collections net to zero', async () => {
    await put({ cancel: true });
    const refund = state.txLog.find((q) => /INSERT INTO payments/.test(q.sql));
    expect(refund).toBeDefined();
    expect(refund!.params).toContain(-400);
  });

  it('restores the stock that was sold', async () => {
    await put({ cancel: true });
    const restore = state.txLog.find((q) => /UPDATE products SET stock = stock \+/.test(q.sql));
    expect(restore!.params[0]).toBe(2);
  });

  it('zeroes the outstanding balance', async () => {
    await put({ cancel: true });
    expect(state.txLog.some((q) => /status='cancelled'/.test(q.sql) && /paid=0, balance=0/.test(q.sql))).toBe(true);
  });

  it('is idempotent — a second cancel does not refund or restock twice', async () => {
    await put({ cancel: true });
    state.invoice.status = 'cancelled';
    state.txLog = [];
    await put({ cancel: true });
    expect(state.txLog.some((q) => /INSERT INTO payments/.test(q.sql))).toBe(false);
    expect(state.txLog.some((q) => /stock = stock \+/.test(q.sql))).toBe(false);
  });
});

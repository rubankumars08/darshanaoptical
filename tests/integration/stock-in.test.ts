import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createSessionToken, type Role } from '@/app/lib/admin/session-token';

const state = vi.hoisted(() => ({
  cookie: undefined as string | undefined,
  user: null as any,
  products: new Map<string, any>(),
  txLog: [] as { sql: string; params: any[] }[],
}));

vi.mock('next/headers', () => ({
  cookies: async () => ({ get: (name: string) => (state.cookie ? { name, value: state.cookie } : undefined) }),
}));

vi.mock('@/app/lib/db', () => {
  const txQuery = async (sql: string, params: any[] = []) => {
    state.txLog.push({ sql, params });
    if (/FROM products WHERE id = \? FOR UPDATE/.test(sql)) {
      const p = state.products.get(params[0]);
      return p ? [p] : [];
    }
    return [];
  };
  return {
    query: vi.fn(async (sql: string, params: any[] = []) => {
      if (/FROM users WHERE id/.test(sql)) return state.user ? [state.user] : [];
      if (/FROM products WHERE id/.test(sql)) {
        const p = state.products.get(params[0]);
        return p ? [p] : [];
      }
      if (/FROM stock_movements/.test(sql)) return [];
      if (/FROM products WHERE status/.test(sql)) return [...state.products.values()];
      return [];
    }),
    withTransaction: vi.fn(async (fn: any) => fn({ query: txQuery })),
    getDbPool: vi.fn(),
  };
});

const stockIn = await import('@/app/api/admin/inventory/stock-in/route');
const inventory = await import('@/app/api/admin/inventory/route');

function signInAs(role: Role) {
  state.user = { id: 'u1', name: 'Arun', email: `${role}@d.com`, role, status: 'active', token_version: 0 };
  state.cookie = createSessionToken({ userId: 'u1', role, name: 'Arun', email: `${role}@d.com`, ver: 0 });
}

const post = (body: unknown) =>
  stockIn.POST(new Request('http://localhost/api/admin/inventory/stock-in', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  }));

const find = (re: RegExp) => state.txLog.find((q) => re.test(q.sql));

beforeEach(() => {
  state.products = new Map([['p1', { id: 'p1', name: 'Aviator', product_code: 'FR-1', stock: 10, purchase_price: 100 }]]);
  state.txLog = [];
  signInAs('manager');
});

describe('recording goods received', () => {
  it('adds the quantity to stock', async () => {
    const res = await post({ product_id: 'p1', quantity: 25 });
    expect(res.status).toBe(201);
    const update = find(/UPDATE products SET stock = stock \+/)!;
    expect(update.params[0]).toBe(25);
  });

  it('writes a stock movement so the item shows as "came in"', async () => {
    await post({ product_id: 'p1', quantity: 25, supplier_name: 'Lens House' });
    const movement = find(/INSERT INTO stock_movements/)!;
    expect(movement.sql).toMatch(/'purchase'/);
    expect(movement.params).toContain(25);
    expect(movement.params).toContain('Lens House');
  });

  it('records who received it', async () => {
    await post({ product_id: 'p1', quantity: 5 });
    expect(find(/INSERT INTO stock_movements/)!.params).toContain('Arun');
  });

  it('updates the cost price only when one is supplied', async () => {
    await post({ product_id: 'p1', quantity: 5, purchase_price: 120 });
    expect(find(/purchase_price/)).toBeDefined();

    state.txLog = [];
    await post({ product_id: 'p1', quantity: 5 });
    expect(find(/purchase_price/)).toBeUndefined();
  });

  it('writes an audit entry', async () => {
    await post({ product_id: 'p1', quantity: 5 });
    expect(find(/INSERT INTO audit_logs/)).toBeDefined();
  });

  it('takes a row lock so a concurrent sale cannot interleave', async () => {
    await post({ product_id: 'p1', quantity: 5 });
    expect(find(/FOR UPDATE/)).toBeDefined();
  });

  it('returns 400 for a product that does not exist', async () => {
    const res = await post({ product_id: 'nope', quantity: 5 });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/not found/i);
  });
});

describe('quantity validation', () => {
  it.each([0, -5, 1.5, 'abc', null])('rejects quantity %s', async (quantity) => {
    expect((await post({ product_id: 'p1', quantity })).status).toBe(400);
  });

  it('requires a product', async () => {
    expect((await post({ quantity: 5 })).status).toBe(400);
  });

  it('accepts a string quantity from the number input', async () => {
    // The form posts form values as strings.
    expect((await post({ product_id: 'p1', quantity: '12' })).status).toBe(201);
    expect(find(/UPDATE products SET stock = stock \+/)!.params[0]).toBe(12);
  });

  it('rejects a negative cost price', async () => {
    expect((await post({ product_id: 'p1', quantity: 5, purchase_price: -1 })).status).toBe(400);
  });
});

describe('permissions', () => {
  it('denies staff — receiving goods sets cost prices', async () => {
    signInAs('staff');
    expect((await post({ product_id: 'p1', quantity: 5 })).status).toBe(403);
  });

  it('allows admin', async () => {
    signInAs('admin');
    expect((await post({ product_id: 'p1', quantity: 5 })).status).toBe(201);
  });

  it('rejects an anonymous request', async () => {
    state.cookie = undefined; state.user = null;
    expect((await post({ product_id: 'p1', quantity: 5 })).status).toBe(401);
  });
});

describe('inventory summary', () => {
  const get = (qs = '') =>
    inventory.GET(new Request(`http://localhost/api/admin/inventory${qs}`));

  it('is readable by any signed-in user', async () => {
    signInAs('staff');
    expect((await get()).status).toBe(200);
  });

  it('defaults the period to the current month', async () => {
    const body = await (await get()).json();
    expect(body.period.from).toMatch(/^\d{4}-\d{2}-01$/);
    expect(body.period.to).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('honours an explicit date range', async () => {
    const body = await (await get('?from=2026-01-01&to=2026-01-31')).json();
    expect(body.period).toEqual({ from: '2026-01-01', to: '2026-01-31' });
  });

  it('reports zero in/out for a product with no movements', async () => {
    const body = await (await get()).json();
    expect(body.products[0]).toMatchObject({ received: 0, sold: 0, returned: 0 });
  });
});

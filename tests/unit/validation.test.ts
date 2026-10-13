import { describe, it, expect } from 'vitest';
import {
  validate,
  staffCreateSchema,
  staffUpdateSchema,
  customerUpdateSchema,
  productUpdateSchema,
  settingsUpdateSchema,
  supplierCreateSchema,
  supplierUpdateSchema,
  invoiceCreateSchema,
  invoiceUpdateSchema,
  purchaseCreateSchema,
} from '@/app/lib/admin/validation';

const ok = <T>(schema: any, payload: unknown): T => {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new Error(`expected valid, got: ${result.error.issues.map((i: any) => `${i.path.join('.')}: ${i.message}`).join('; ')}`);
  }
  return result.data as T;
};
const rejects = (schema: any, payload: unknown) => expect(schema.safeParse(payload).success).toBe(false);

describe('validate() helper', () => {
  it('returns parsed data on success', () => {
    const r = validate(staffCreateSchema, {
      name: 'New Person', email: 'New@Darshana.com', password: 'abcd123456', role: 'staff',
    });
    expect(r.error).toBeUndefined();
    expect(r.data?.email).toBe('new@darshana.com'); // normalised
  });

  it('returns a 400 response listing the failing fields', async () => {
    const r = validate(staffCreateSchema, { name: '', email: 'nope', role: 'owner', password: 'x' });
    expect(r.data).toBeUndefined();
    expect(r.error!.status).toBe(400);
    const body = await r.error!.json();
    expect(body.error).toMatch(/email/);
  });
});

describe('staffUpdateSchema', () => {
  // This is the exact body app/admin/staff/page.tsx posts: { id, ...form }.
  const formBody = (over: Record<string, unknown> = {}) => ({
    id: 'usr-002', name: 'Arun Kumar', email: 'manager@darshana.com',
    phone: '99999', role: 'manager', password: '', status: 'active', ...over,
  });

  it('treats a blank password as "keep the current one"', () => {
    // Regression guard: the edit form labels this field "leave blank to keep"
    // and always submits it. A min(1) rule here rejected every staff edit.
    const data = ok<any>(staffUpdateSchema, formBody());
    expect(data.password).toBeUndefined();
  });

  it('accepts a replacement password', () => {
    expect(ok<any>(staffUpdateSchema, formBody({ password: 'brandnew123' })).password).toBe('brandnew123');
  });

  it('strips email so an update cannot change the sign-in address', () => {
    expect(ok<any>(staffUpdateSchema, formBody())).not.toHaveProperty('email');
  });

  it('requires an id', () => rejects(staffUpdateSchema, formBody({ id: undefined })));

  it.each(['owner', 'superadmin', 'ADMIN', ''])('rejects role %j', (role) =>
    rejects(staffUpdateSchema, formBody({ role }))
  );

  it.each(['deleted', 'banned', ''])('rejects status %j', (status) =>
    rejects(staffUpdateSchema, formBody({ status }))
  );
});

describe('staffCreateSchema', () => {
  const body = (over = {}) => ({ name: 'New', email: 'a@b.com', password: 'abcd123456', role: 'staff', phone: '', ...over });

  it('accepts the add-staff form body', () => expect(ok<any>(staffCreateSchema, body()).role).toBe('staff'));
  it('lowercases and trims the email', () =>
    expect(ok<any>(staffCreateSchema, body({ email: '  Mixed@Case.COM ' })).email).toBe('mixed@case.com'));
  it.each(['notanemail', '', 'a@', '@b.com'])('rejects email %j', (email) => rejects(staffCreateSchema, body({ email })));
  it('rejects an unknown role', () => rejects(staffCreateSchema, body({ role: 'owner' })));
  it('requires a password field', () => rejects(staffCreateSchema, body({ password: '' })));
});

describe('customerUpdateSchema', () => {
  it('accepts a whole customer row spread from the API (nulls and date strings)', () => {
    // app/admin/customers/[id]/page.tsx does setEditForm({ ...customer }).
    ok(customerUpdateSchema, {
      id: 'c1', customer_id: 'DO-2026-001', name: 'Ravi', phone: '9000000000',
      email: null, gender: null, dob: null, address: null, notes: null, status: 'active',
      last_visit: '2026-01-01T00:00:00.000Z', created_at: '2026-01-01T00:00:00.000Z',
    });
  });

  it('accepts empty strings from cleared form inputs', () => {
    ok(customerUpdateSchema, { name: 'Ravi', phone: '900', email: '', gender: '', dob: '', address: '', notes: '' });
  });

  it('strips identity columns so they cannot be rewritten', () => {
    const data = ok<any>(customerUpdateSchema, { id: 'hacked', customer_id: 'DO-9999-999', name: 'Ravi' });
    expect(data).not.toHaveProperty('id');
    expect(data).not.toHaveProperty('customer_id');
  });

  it.each(['male', 'female', 'other'])('accepts gender %s', (gender) => ok(customerUpdateSchema, { gender }));
  it('rejects an unknown gender', () => rejects(customerUpdateSchema, { gender: 'unknown' }));
  it('rejects a malformed email', () => rejects(customerUpdateSchema, { email: 'not-an-email' }));
  it('rejects an empty name', () => rejects(customerUpdateSchema, { name: '' }));
});

describe('productUpdateSchema', () => {
  const row = (over = {}) => ({
    id: 'p1', product_code: 'FR-123', name: 'Aviator', brand: 'RayBan', model: '', category: 'frame',
    color: '', size: '', material: '', purchase_price: 100, selling_price: 200, mrp: 250,
    stock: 5, low_stock_threshold: 5, image_url: '', description: '', status: 'active',
    created_at: '2026-01-01T00:00:00.000Z', ...over,
  });

  it('accepts the full row the edit form spreads', () => ok(productUpdateSchema, row()));

  it('strips id, product_code and stock so they cannot be set directly', () => {
    const data = ok<any>(productUpdateSchema, row());
    for (const key of ['id', 'product_code', 'stock', 'created_at']) expect(data).not.toHaveProperty(key);
  });

  it.each(['frames', 'lenses', 'sunglasses', 'other'])('rejects plural/unknown category %s', (category) =>
    rejects(productUpdateSchema, row({ category }))
  );

  it('rejects negative prices', () => {
    rejects(productUpdateSchema, row({ selling_price: -1 }));
    rejects(productUpdateSchema, row({ purchase_price: -0.01 }));
  });

  it('allows a negative stock_adjustment but requires a whole number', () => {
    expect(ok<any>(productUpdateSchema, row({ stock_adjustment: -3 })).stock_adjustment).toBe(-3);
    rejects(productUpdateSchema, row({ stock_adjustment: 1.5 }));
  });
});

describe('settingsUpdateSchema', () => {
  it('keeps only known keys, dropping anything else in the body', () => {
    const data = ok<any>(settingsUpdateSchema, {
      shop_name: 'Darshana Optical', max_discount_staff: 5,
      id: 99, injected_column: 'DROP TABLE users',
    });
    expect(data).toEqual({ shop_name: 'Darshana Optical', max_discount_staff: 5 });
  });

  it.each([-1, 101, 250])('rejects an out-of-range discount cap %i', (v) =>
    rejects(settingsUpdateSchema, { max_discount_staff: v })
  );

  it('rejects an out-of-range tax rate', () => rejects(settingsUpdateSchema, { tax_rate: 120 }));
});

describe('supplier schemas', () => {
  const row = (over = {}) => ({
    id: 'sup-1', name: 'Lens House', contact_person: 'Suresh', phone: '9000000000',
    email: 'lens@house.com', address: 'Salem', gst: '33ABCDE1234F1Z5',
    balance: 12500, status: 'active', created_at: '2026-01-01T00:00:00.000Z', ...over,
  });

  it('strips balance so it can never be set from the edit form', () => {
    // balance is owned by the purchases flow. If it were accepted here, anyone
    // with the supplier edit screen could write off money the shop owes.
    const data = ok<any>(supplierUpdateSchema, row({ balance: 0 }));
    expect(data).not.toHaveProperty('balance');
  });

  it('strips balance on create too', () => {
    expect(ok<any>(supplierCreateSchema, row())).not.toHaveProperty('balance');
  });

  it('strips id and timestamps', () => {
    const data = ok<any>(supplierUpdateSchema, row());
    for (const key of ['id', 'created_at']) expect(data).not.toHaveProperty(key);
  });

  it('accepts the whole supplier row the edit dialog spreads', () => ok(supplierUpdateSchema, row()));
  it('accepts a partial update', () => ok(supplierUpdateSchema, { name: 'Only Name' }));
  it('requires name and phone on create', () => {
    rejects(supplierCreateSchema, row({ name: '' }));
    rejects(supplierCreateSchema, row({ phone: '' }));
  });
  it('accepts a cleared email but rejects a malformed one', () => {
    ok(supplierUpdateSchema, row({ email: '' }));
    rejects(supplierUpdateSchema, row({ email: 'nope' }));
  });
  it('rejects an unknown status', () => rejects(supplierUpdateSchema, row({ status: 'deleted' })));
});

describe('invoiceCreateSchema', () => {
  const item = (over = {}) => ({
    product_id: 'p1', product_name: 'Aviator', product_code: 'FR-1',
    category: 'frame', quantity: 1, unit_price: 100, ...over,
  });
  const body = (over = {}) => ({
    customer_id: 'c1', customer_name: 'Ravi', customer_phone: '900', items: [item()], ...over,
  });

  it('accepts a minimal sale', () => ok(invoiceCreateSchema, body()));
  it('requires at least one line item', () => rejects(invoiceCreateSchema, body({ items: [] })));
  it('requires a customer', () => rejects(invoiceCreateSchema, body({ customer_id: '' })));
  it('rejects a zero or negative quantity', () => {
    rejects(invoiceCreateSchema, body({ items: [item({ quantity: 0 })] }));
    rejects(invoiceCreateSchema, body({ items: [item({ quantity: -2 })] }));
  });
  it('rejects a negative unit price', () => rejects(invoiceCreateSchema, body({ items: [item({ unit_price: -5 })] })));
  it.each([-1, 101])('rejects discount_percent %i', (v) => rejects(invoiceCreateSchema, body({ discount_percent: v })));
  it('rejects an unknown payment method', () => rejects(invoiceCreateSchema, body({ payment_method: 'crypto' })));
  it('rejects an unknown product category', () => rejects(invoiceCreateSchema, body({ items: [item({ category: 'frames' })] })));
});

describe('invoiceUpdateSchema', () => {
  it('rejects a zero or negative payment', () => {
    rejects(invoiceUpdateSchema, { add_payment: 0 });
    rejects(invoiceUpdateSchema, { add_payment: -100 });
  });
  it('accepts a positive payment', () => expect(ok<any>(invoiceUpdateSchema, { add_payment: 250 }).add_payment).toBe(250));
  it('rejects an unknown order status', () => rejects(invoiceUpdateSchema, { order_status: 'shipped' }));
  it.each(['new', 'lens_ordered', 'in_process', 'ready', 'delivered', 'cancelled'])(
    'accepts order status %s', (s) => ok(invoiceUpdateSchema, { order_status: s })
  );
});

describe('purchaseCreateSchema', () => {
  const body = (over = {}) => ({
    supplier_id: 's1', supplier_name: 'Lens Co',
    items: [{ product_id: 'p1', quantity: 10, purchase_price: 50 }], ...over,
  });
  it('accepts a purchase', () => ok(purchaseCreateSchema, body()));
  it('requires a supplier', () => rejects(purchaseCreateSchema, body({ supplier_id: '' })));
  it('requires at least one item', () => rejects(purchaseCreateSchema, body({ items: [] })));
  it('rejects a non-positive quantity', () =>
    rejects(purchaseCreateSchema, body({ items: [{ product_id: 'p1', quantity: 0, purchase_price: 5 }] })));
});

import { NextResponse } from 'next/server';
import { z, ZodSchema } from 'zod';

/**
 * Validates `data` against `schema`. Returns `{ data }` on success or
 * `{ error }` (a ready-to-return 400 NextResponse) on failure.
 */
export function validate<T>(schema: ZodSchema<T>, data: unknown): { data: T; error?: undefined } | { data?: undefined; error: NextResponse } {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues.map((i) => `${i.path.join('.') || 'body'}: ${i.message}`).join('; ');
    return { error: NextResponse.json({ error: message }, { status: 400 }) };
  }
  return { data: result.data };
}

const paymentMethod = z.enum(['cash', 'upi', 'card', 'bank']);
const productCategory = z.enum(['frame', 'lens', 'sunglass', 'accessory', 'service']);
export const roleEnum = z.enum(['admin', 'manager', 'staff']);
const statusEnum = z.enum(['active', 'inactive']);

// ─── Staff ────────────────────────────────────────────────────────────────────
// Password strength is checked separately by validatePasswordStrength() in
// password.ts so the same rule applies to seeding and any future reset flow.

export const staffCreateSchema = z.object({
  name: z.string().trim().min(1, 'name is required').max(255),
  email: z.string().trim().toLowerCase().email('a valid email is required').max(255),
  password: z.string().min(1, 'password is required'),
  role: roleEnum,
  phone: z.string().trim().max(20).optional().nullable(),
});

export const staffUpdateSchema = z.object({
  id: z.string().min(1, 'id is required'),
  name: z.string().trim().min(1).max(255).optional(),
  role: roleEnum.optional(),
  phone: z.string().trim().max(20).optional().nullable(),
  status: statusEnum.optional(),
  // The edit form always posts this field and sends '' for "leave blank to keep
  // the current password", so an empty string must mean "absent" rather than
  // failing validation.
  password: z.preprocess((v) => (v === '' ? undefined : v), z.string().min(1).optional()),
});

// ─── Customers ────────────────────────────────────────────────────────────────

export const customerUpdateSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  phone: z.string().trim().min(1).max(20).optional(),
  email: z.string().trim().email().max(255).optional().nullable().or(z.literal('')),
  gender: z.enum(['male', 'female', 'other']).optional().nullable().or(z.literal('')),
  dob: z.string().optional().nullable().or(z.literal('')),
  address: z.string().max(1000).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  status: statusEnum.optional(),
});

// ─── Products ─────────────────────────────────────────────────────────────────

export const productUpdateSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  brand: z.string().trim().min(1).max(255).optional(),
  model: z.string().max(255).optional().nullable(),
  category: productCategory.optional(),
  color: z.string().max(100).optional().nullable(),
  size: z.string().max(100).optional().nullable(),
  material: z.string().max(100).optional().nullable(),
  purchase_price: z.coerce.number().nonnegative().optional(),
  selling_price: z.coerce.number().nonnegative().optional(),
  mrp: z.coerce.number().nonnegative().optional(),
  low_stock_threshold: z.coerce.number().int().nonnegative().optional(),
  image_url: z.string().max(2000).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  status: statusEnum.optional(),
  stock_adjustment: z.coerce.number().int().optional(),
  adjustment_reason: z.string().max(500).optional().nullable(),
});

// ─── Stock in (goods received) ────────────────────────────────────────────────
// The lightweight counterpart to a full purchase order: just "these arrived".

export const stockInSchema = z.object({
  product_id: z.string().min(1, 'product_id is required'),
  quantity: z.coerce.number().int().positive('quantity must be a whole number above zero'),
  purchase_price: z.coerce.number().nonnegative().optional(),
  supplier_name: z.string().trim().max(255).optional().nullable(),
  reason: z.string().trim().max(500).optional().nullable(),
});

// ─── Suppliers ────────────────────────────────────────────────────────────────
// `balance` is deliberately absent. It is derived from purchases (the purchase
// route does `balance = balance + ?`), and the edit form spreads the whole
// supplier row into its body — so accepting it here would let anyone with the
// edit screen silently write off money the shop owes a supplier.

const supplierFields = {
  name: z.string().trim().min(1).max(255),
  contact_person: z.string().trim().max(255).optional().nullable(),
  phone: z.string().trim().min(1).max(20),
  email: z.string().trim().email().max(255).optional().nullable().or(z.literal('')),
  address: z.string().max(1000).optional().nullable(),
  gst: z.string().trim().max(20).optional().nullable(),
  status: statusEnum.optional(),
};

export const supplierCreateSchema = z.object(supplierFields);

export const supplierUpdateSchema = z.object({
  ...supplierFields,
  name: supplierFields.name.optional(),
  phone: supplierFields.phone.optional(),
});

// ─── Shop settings ────────────────────────────────────────────────────────────
// Explicit field list — the route used to spread the whole request body into the
// UPDATE, so any unexpected key rode along.

export const settingsUpdateSchema = z.object({
  shop_name: z.string().trim().min(1).max(255).optional(),
  tagline: z.string().max(255).optional().nullable(),
  phone: z.string().max(20).optional(),
  whatsapp: z.string().max(20).optional().nullable(),
  email: z.string().max(255).optional(),
  address: z.string().max(1000).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pincode: z.string().max(10).optional(),
  gst: z.string().max(20).optional().nullable(),
  invoice_prefix: z.string().max(10).optional(),
  customer_id_prefix: z.string().max(10).optional(),
  low_stock_threshold: z.coerce.number().int().nonnegative().optional(),
  tax_enabled: z.coerce.boolean().optional(),
  tax_rate: z.coerce.number().min(0).max(100).optional(),
  invoice_footer: z.string().max(2000).optional().nullable(),
  invoice_terms: z.string().max(2000).optional().nullable(),
  max_discount_admin: z.coerce.number().min(0).max(100).optional(),
  max_discount_manager: z.coerce.number().min(0).max(100).optional(),
  max_discount_staff: z.coerce.number().min(0).max(100).optional(),
});

export const invoiceItemSchema = z.object({
  product_id: z.string().min(1, 'product_id is required'),
  product_name: z.string().min(1),
  product_code: z.string().min(1),
  category: productCategory,
  quantity: z.coerce.number().positive('quantity must be positive'),
  unit_price: z.coerce.number().nonnegative(),
  discount: z.coerce.number().nonnegative().optional(),
});

export const invoiceCreateSchema = z.object({
  customer_id: z.string().min(1, 'customer_id is required'),
  customer_name: z.string().min(1),
  customer_phone: z.string().min(1),
  eye_test_id: z.string().optional().nullable(),
  items: z.array(invoiceItemSchema).min(1, 'at least one item is required'),
  discount_percent: z.coerce.number().min(0).max(100).optional(),
  discount_amount: z.coerce.number().min(0).optional(),
  payment_method: paymentMethod.optional(),
  amount_paid: z.coerce.number().min(0).optional(),
  advance_paid: z.coerce.number().min(0).optional(),
  notes: z.string().optional().nullable(),
  has_order: z.boolean().optional(),
  expected_date: z.string().optional().nullable(),
  frame_product: z.string().optional().nullable(),
  lens_product: z.string().optional().nullable(),
});

export const invoiceUpdateSchema = z.object({
  add_payment: z.coerce.number().positive('add_payment must be a positive number').optional(),
  payment_method: paymentMethod.optional(),
  payment_notes: z.string().optional().nullable(),
  order_status: z.enum(['new', 'lens_ordered', 'in_process', 'ready', 'delivered', 'cancelled']).optional(),
  cancel: z.boolean().optional(),
  notes: z.string().optional().nullable(),
});

export const purchaseItemSchema = z.object({
  product_id: z.string().optional(),
  product_name: z.string().optional(),
  description: z.string().optional(),
  product_code: z.string().optional(),
  quantity: z.coerce.number().positive('quantity must be positive'),
  purchase_price: z.coerce.number().nonnegative().optional(),
  unit_cost: z.coerce.number().nonnegative().optional(),
});

export const purchaseCreateSchema = z.object({
  supplier_id: z.string().min(1, 'supplier_id is required'),
  supplier_name: z.string().min(1),
  supplier_bill_number: z.string().optional().nullable(),
  items: z.array(purchaseItemSchema).min(1, 'at least one item is required'),
  amount_paid: z.coerce.number().min(0).optional(),
  paid: z.coerce.number().min(0).optional(),
  notes: z.string().optional().nullable(),
});

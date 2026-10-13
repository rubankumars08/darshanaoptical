import { NextResponse } from 'next/server';
import { query, withTransaction } from '@/app/lib/db';
import { requireSession, type Role } from '@/app/lib/admin/session';
import { validate, invoiceCreateSchema } from '@/app/lib/admin/validation';
import { nextSequence } from '@/app/lib/admin/sequence';
import { randomUUID } from 'crypto';

/**
 * Highest discount percent this role may apply, from shop_settings.
 * Falls back to the conservative built-in defaults if the row is missing.
 */
async function maxDiscountFor(role: Role): Promise<number> {
  const [s] = (await query(
    'SELECT max_discount_admin, max_discount_manager, max_discount_staff FROM shop_settings WHERE id=1'
  )) as any[];
  const raw =
    role === 'admin' ? s?.max_discount_admin ?? 100
    : role === 'manager' ? s?.max_discount_manager ?? 15
    : s?.max_discount_staff ?? 5;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.min(Math.max(n, 0), 100) : 0;
}

export async function GET(request: Request) {
  const { error } = await requireSession();
  if (error) return error;
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') ?? 'all';
  const q = searchParams.get('q') ?? '';
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  let sql = 'SELECT * FROM invoices WHERE 1=1';
  const params: any[] = [];
  if (status !== 'all') { sql += ' AND status = ?'; params.push(status); }
  if (from) { sql += ' AND DATE(created_at) >= ?'; params.push(from); }
  if (to)   { sql += ' AND DATE(created_at) <= ?'; params.push(to); }
  if (q) {
    sql += ' AND (invoice_number LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)';
    const like = `%${q}%`;
    params.push(like, like, like);
  }
  sql += ' ORDER BY created_at DESC LIMIT 500';
  const rows = await query(sql, params);
  return NextResponse.json({ invoices: rows });
}

export async function POST(request: Request) {
  const { session, error } = await requireSession();
  if (error) return error;
  const parsed = validate(invoiceCreateSchema, await request.json());
  if (parsed.error) return parsed.error;
  const b = parsed.data;
  const {
    customer_id, customer_name, customer_phone, eye_test_id,
    items, discount_percent, payment_method, amount_paid,
    notes, has_order, expected_date, frame_product, lens_product,
  } = b;

  // Calculate totals
  const subtotal = items.reduce((s: number, i: any) => s + (i.unit_price * (i.quantity ?? i.qty ?? 1) - (i.discount ?? 0)), 0);
  const discount_amount = b.discount_amount !== undefined ? b.discount_amount : subtotal * ((discount_percent ?? 0) / 100);

  // A discount must never exceed the bill, or the invoice total goes negative.
  if (discount_amount < 0 || discount_amount > subtotal) {
    return NextResponse.json(
      { error: 'Discount cannot be negative or greater than the subtotal.' },
      { status: 400 }
    );
  }

  // Enforce the per-role discount ceiling from shop settings. Checked against the
  // effective percentage so a raw `discount_amount` cannot bypass the cap.
  const effectivePercent = subtotal > 0 ? (discount_amount / subtotal) * 100 : 0;
  const cap = await maxDiscountFor(session.role);
  if (effectivePercent > cap + 0.001) {
    return NextResponse.json(
      { error: `Discount of ${effectivePercent.toFixed(1)}% exceeds the ${cap}% limit for your role.` },
      { status: 403 }
    );
  }

  const total = Math.round((subtotal - discount_amount) * 100) / 100;
  const initialPaid = amount_paid ?? b.advance_paid ?? 0;
  const paid = Math.min(initialPaid, total);
  const balance = Math.round((total - paid) * 100) / 100;
  const status =
    paid >= total ? 'paid' :
    paid > 0      ? 'partially_paid' : 'pending';

  const year = new Date().getFullYear();
  const id = randomUUID();
  let invoice_number = '';

  try {
    await withTransaction(async (tx) => {
      // Numbered inside the transaction so concurrent sales cannot collide.
      invoice_number = `DO-${year}-${String(await nextSequence(tx, 'invoice')).padStart(5, '0')}`;

      await tx.query(
        `INSERT INTO invoices
           (id,invoice_number,customer_id,customer_name,customer_phone,eye_test_id,
            subtotal,discount_amount,discount_percent,total,paid,balance,status,
            order_status,frame_product,lens_product,expected_date,created_by,notes)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [id, invoice_number, customer_id, customer_name, customer_phone,
         eye_test_id||null, subtotal, discount_amount, discount_percent??0,
         total, paid, balance, status,
         has_order ? 'new' : null, frame_product||null, lens_product||null,
         expected_date||null, session.name, notes||null]
      );

      // Insert invoice items + decrement stock
      for (const item of items) {
        const itemId = randomUUID();
        const itemTotal = item.unit_price * item.quantity - (item.discount ?? 0);
        await tx.query(
          `INSERT INTO invoice_items (id,invoice_id,product_id,product_name,product_code,category,quantity,unit_price,discount,total)
           VALUES (?,?,?,?,?,?,?,?,?,?)`,
          [itemId, id, item.product_id, item.product_name, item.product_code,
           item.category, item.quantity, item.unit_price, item.discount??0, itemTotal]
        );
        if (item.category !== 'service') {
          // Lock the product row so concurrent sales can't both pass the stock check and oversell.
          const [product] = await tx.query('SELECT stock, name FROM products WHERE id = ? FOR UPDATE', [item.product_id]) as any[];
          if (!product) throw new Error(`Product not found: ${item.product_name}`);
          if (product.stock < item.quantity) {
            throw new Error(`Insufficient stock for ${item.product_name} (have ${product.stock}, need ${item.quantity})`);
          }
          await tx.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
          await tx.query(
            `INSERT INTO stock_movements (id,product_id,product_name,product_code,type,quantity,reason,reference,created_by)
             VALUES (?,?,?,?,'sale',?,?,?,?)`,
            [randomUUID(), item.product_id, item.product_name, item.product_code,
             -item.quantity, `Sold via invoice ${invoice_number}`, invoice_number, session.name]
          );
        }
      }

      // Record payment if any
      if (paid > 0) {
        await tx.query(
          `INSERT INTO payments (id,invoice_id,amount,method,payment_date,received_by) VALUES (?,?,?,?,NOW(),?)`,
          [randomUUID(), id, paid, payment_method??'cash', session.name]
        );
      }

      // Update customer last_visit
      await tx.query('UPDATE customers SET last_visit = NOW() WHERE id = ?', [customer_id]);

      await tx.query(
        `INSERT INTO audit_logs (id,action,entity,entity_id,details,performed_by,performed_by_role) VALUES (?,?,?,?,?,?,?)`,
        [randomUUID(), 'CREATE', 'invoice', id,
         `Created invoice ${invoice_number} for ${customer_name} — ₹${total}`, session.name, session.role]
      );
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Failed to create invoice.' }, { status: 400 });
  }

  const [newInv] = await query('SELECT * FROM invoices WHERE id = ?', [id]) as any[];
  const invItems = await query('SELECT * FROM invoice_items WHERE invoice_id = ?', [id]);
  return NextResponse.json({ invoice: newInv, items: invItems, invoice_number }, { status: 201 });
}

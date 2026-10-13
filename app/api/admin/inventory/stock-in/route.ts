import { NextResponse } from 'next/server';
import { query, withTransaction } from '@/app/lib/db';
import { requireRole } from '@/app/lib/admin/session';
import { validate, stockInSchema } from '@/app/lib/admin/validation';
import { randomUUID } from 'crypto';

// POST /api/admin/inventory/stock-in
//
// Records goods arriving, without the purchase-order machinery (supplier
// accounts, bill numbers, part-payments, outstanding balances). Use this for the
// everyday "a box of frames came in today" case; use /purchases when the money
// side actually has to be tracked.
export async function POST(request: Request) {
  const { session, error } = await requireRole('admin', 'manager');
  if (error) return error;

  const parsed = validate(stockInSchema, await request.json());
  if (parsed.error) return parsed.error;
  const b = parsed.data;

  try {
    await withTransaction(async (tx) => {
      // Lock the row so a concurrent sale cannot interleave with the increment.
      const [locked] = (await tx.query(
        'SELECT id, name, product_code, stock FROM products WHERE id = ? FOR UPDATE',
        [b.product_id]
      )) as any[];
      if (!locked) throw new Error('Product not found.');

      if (b.purchase_price !== undefined) {
        await tx.query('UPDATE products SET stock = stock + ?, purchase_price = ?, updated_at = NOW() WHERE id = ?',
          [b.quantity, b.purchase_price, b.product_id]);
      } else {
        await tx.query('UPDATE products SET stock = stock + ?, updated_at = NOW() WHERE id = ?',
          [b.quantity, b.product_id]);
      }

      await tx.query(
        `INSERT INTO stock_movements (id,product_id,product_name,product_code,type,quantity,reason,reference,created_by)
         VALUES (?,?,?,?,'purchase',?,?,?,?)`,
        [randomUUID(), locked.id, locked.name, locked.product_code, b.quantity,
         b.reason || 'Stock received', b.supplier_name || null, session.name]
      );

      await tx.query(
        `INSERT INTO audit_logs (id,action,entity,entity_id,details,performed_by,performed_by_role) VALUES (?,?,?,?,?,?,?)`,
        [randomUUID(), 'CREATE', 'product', locked.id,
         `Stock in: +${b.quantity} of ${locked.name}${b.supplier_name ? ` from ${b.supplier_name}` : ''}`,
         session.name, session.role]
      );
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Failed to record stock.' }, { status: 400 });
  }

  const [updated] = (await query('SELECT * FROM products WHERE id = ?', [b.product_id])) as any[];
  return NextResponse.json({ product: updated, received: b.quantity }, { status: 201 });
}

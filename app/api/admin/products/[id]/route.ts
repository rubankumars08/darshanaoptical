import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { requireRole, requireSession } from '@/app/lib/admin/session';
import { validate, productUpdateSchema } from '@/app/lib/admin/validation';
import { randomUUID } from 'crypto';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireSession();
  if (error) return error;
  const { id } = await params;
  const [row] = await query('SELECT * FROM products WHERE id = ?', [id]) as any[];
  if (!row) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  const movements = await query(
    'SELECT * FROM stock_movements WHERE product_id = ? ORDER BY created_at DESC LIMIT 50', [id]
  );
  return NextResponse.json({ product: row, movements });
}

// Editing a product changes prices and stock levels — management only.
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireRole('admin', 'manager');
  if (error) return error;
  const { id } = await params;
  const [existing] = await query('SELECT * FROM products WHERE id = ?', [id]) as any[];
  if (!existing) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  const parsed = validate(productUpdateSchema, await request.json());
  if (parsed.error) return parsed.error;
  const b = parsed.data;
  // Merge only validated keys over the stored row.
  const p = { ...existing, ...b };

  await query(
    `UPDATE products SET name=?,brand=?,model=?,category=?,color=?,size=?,material=?,
       purchase_price=?,selling_price=?,mrp=?,low_stock_threshold=?,image_url=?,description=?,status=?,updated_at=NOW()
     WHERE id=?`,
    [p.name, p.brand, p.model||null, p.category, p.color||null, p.size||null, p.material||null,
     p.purchase_price??0, p.selling_price??0, p.mrp??0, p.low_stock_threshold??5,
     p.image_url||null, p.description||null, p.status??'active', id]
  );
  // Manual stock adjustment. The movement row records the product's real name and
  // code from the stored row — the request body need not carry them.
  if (b.stock_adjustment && b.stock_adjustment !== 0) {
    if (Number(existing.stock) + b.stock_adjustment < 0) {
      return NextResponse.json(
        { error: `Adjustment would take stock below zero (current ${existing.stock}).` },
        { status: 400 }
      );
    }
    await query('UPDATE products SET stock = stock + ? WHERE id = ?', [b.stock_adjustment, id]);
    await query(
      `INSERT INTO stock_movements (id,product_id,product_name,product_code,type,quantity,reason,created_by)
       VALUES (?,?,?,?,'adjustment',?,?,?)`,
      [randomUUID(), id, p.name, existing.product_code, b.stock_adjustment, b.adjustment_reason||'Manual adjustment', session.name]
    );
  }
  await query(
    `INSERT INTO audit_logs (id,action,entity,entity_id,details,performed_by,performed_by_role) VALUES (?,?,?,?,?,?,?)`,
    [randomUUID(), 'UPDATE', 'product', id, `Updated product: ${p.name}`, session.name, session.role]
  );
  const [updated] = await query('SELECT * FROM products WHERE id = ?', [id]) as any[];
  return NextResponse.json({ product: updated });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireSession();
  if (error) return error;
  if (session.role !== 'admin') return NextResponse.json({ error: 'Admin only.' }, { status: 403 });
  const { id } = await params;
  const [p] = await query('SELECT name FROM products WHERE id = ?', [id]) as any[];
  if (!p) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  await query("UPDATE products SET status='inactive' WHERE id=?", [id]); // soft delete
  await query(
    `INSERT INTO audit_logs (id,action,entity,entity_id,details,performed_by,performed_by_role) VALUES (?,?,?,?,?,?,?)`,
    [randomUUID(), 'DELETE', 'product', id, `Deactivated product: ${p.name}`, session.name, session.role]
  );
  return NextResponse.json({ success: true });
}

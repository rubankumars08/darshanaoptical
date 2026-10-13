import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { requireRole, requireSession } from '@/app/lib/admin/session';
import { randomUUID } from 'crypto';

export async function GET(request: Request) {
  // Any signed-in user may browse the catalogue — the POS needs it.
  const { error } = await requireSession();
  if (error) return error;
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') ?? 'all';
  const status = searchParams.get('status') ?? 'all';
  const q = searchParams.get('q') ?? '';

  let sql = 'SELECT * FROM products WHERE 1=1';
  const params: any[] = [];
  if (category !== 'all') { sql += ' AND category = ?'; params.push(category); }
  if (status !== 'all') { sql += ' AND status = ?'; params.push(status); }
  if (q) {
    sql += ' AND (name LIKE ? OR brand LIKE ? OR product_code LIKE ?)';
    const like = `%${q}%`;
    params.push(like, like, like);
  }
  sql += ' ORDER BY category, brand, name LIMIT 1000';
  const rows = await query(sql, params);
  return NextResponse.json({ products: rows });
}

// Creating stock sets purchase and selling prices — management only.
export async function POST(request: Request) {
  const { session, error } = await requireRole('admin', 'manager');
  if (error) return error;
  const b = await request.json();
  if (!b.name || !b.brand || !b.category) {
    return NextResponse.json({ error: 'name, brand and category are required.' }, { status: 400 });
  }
  let cat = (b.category || 'frame').toLowerCase();
  if (cat === 'frames') cat = 'frame';
  if (cat === 'lenses') cat = 'lens';
  if (cat === 'sunglasses') cat = 'sunglass';
  if (cat === 'accessories') cat = 'accessory';
  if (cat === 'services') cat = 'service';

  const id = randomUUID();
  const code = b.product_code || `${cat.toUpperCase().slice(0,2)}-${Date.now().toString().slice(-6)}`;
  const purchase_price = b.purchase_price ?? b.cost_price ?? 0;
  const selling_price = b.selling_price ?? 0;
  const stock = b.stock ?? b.stock_qty ?? 0;
  const low_stock_threshold = b.low_stock_threshold ?? b.min_stock ?? 5;

  await query(
    `INSERT INTO products (id,product_code,name,brand,model,category,color,size,material,
       purchase_price,selling_price,mrp,stock,low_stock_threshold,image_url,description,status)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'active')`,
    [id, code, b.name, b.brand, b.model || b.model_number || null, cat, b.color || null, b.size || null,
     b.material || null, purchase_price, selling_price, b.mrp ?? selling_price,
     stock, low_stock_threshold, b.image_url || null, b.description || null]
  );
  await query(
    `INSERT INTO audit_logs (id,action,entity,entity_id,details,performed_by,performed_by_role) VALUES (?,?,?,?,?,?,?)`,
    [randomUUID(), 'CREATE', 'product', id, `Added product: ${b.name}`, session.name, session.role]
  );
  const [row] = await query('SELECT * FROM products WHERE id = ?', [id]) as any[];
  return NextResponse.json({ product: row }, { status: 201 });
}

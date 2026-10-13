import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { requireSession } from '@/app/lib/admin/session';

// GET /api/admin/inventory?from=YYYY-MM-DD&to=YYYY-MM-DD
//
// Returns current stock plus, for the chosen period, how much of each product
// came in and how much went out — the "how many arrived vs how many sold"
// question the stock screen is really there to answer. Defaults to this month.
export async function GET(request: Request) {
  const { error } = await requireSession();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const today = new Date().toISOString().slice(0, 10);
  const from = searchParams.get('from') || `${today.slice(0, 7)}-01`;
  const to = searchParams.get('to') || today;

  const [products, movements, totals] = await Promise.all([
    query("SELECT * FROM products WHERE status='active' ORDER BY category, brand, name LIMIT 1000"),
    query(
      `SELECT * FROM stock_movements
        WHERE DATE(created_at) BETWEEN ? AND ?
        ORDER BY created_at DESC LIMIT 200`,
      [from, to]
    ),
    // Sales are stored as negative quantities, so flip the sign to report them.
    query(
      `SELECT product_id,
              COALESCE(SUM(CASE WHEN type='purchase' THEN quantity ELSE 0 END), 0)  AS received,
              COALESCE(SUM(CASE WHEN type='sale'     THEN -quantity ELSE 0 END), 0) AS sold,
              COALESCE(SUM(CASE WHEN type='return'   THEN quantity ELSE 0 END), 0)  AS returned,
              COALESCE(SUM(CASE WHEN type IN ('adjustment','damage') THEN quantity ELSE 0 END), 0) AS adjusted
         FROM stock_movements
        WHERE DATE(created_at) BETWEEN ? AND ?
        GROUP BY product_id`,
      [from, to]
    ),
  ]);

  // Attach the period figures to each product so the page needs no client-side join.
  const byProduct = new Map<string, any>();
  for (const row of totals as any[]) byProduct.set(row.product_id, row);

  const withTotals = (products as any[]).map((p) => {
    const t = byProduct.get(p.id);
    return {
      ...p,
      received: Number(t?.received ?? 0),
      sold: Number(t?.sold ?? 0),
      returned: Number(t?.returned ?? 0),
      adjusted: Number(t?.adjusted ?? 0),
    };
  });

  return NextResponse.json({ products: withTotals, movements, period: { from, to } });
}

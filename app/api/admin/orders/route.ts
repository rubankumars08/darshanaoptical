import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { requireSession } from '@/app/lib/admin/session';

export async function GET() {
  const { error } = await requireSession();
  if (error) return error;
  const rows = await query(
    `SELECT * FROM invoices WHERE order_status IS NOT NULL AND order_status != 'cancelled'
     ORDER BY FIELD(order_status,'new','lens_ordered','in_process','ready','delivered'), expected_date ASC
     LIMIT 300`
  );
  return NextResponse.json({ orders: rows });
}

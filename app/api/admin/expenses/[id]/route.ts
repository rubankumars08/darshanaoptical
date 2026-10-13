import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { requireRole } from '@/app/lib/admin/session';
import { randomUUID } from 'crypto';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireRole('admin', 'manager');
  if (error) return error;
  const { id } = await params;
  const [e] = await query('SELECT * FROM expenses WHERE id = ?', [id]) as any[];
  if (!e) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  await query('DELETE FROM expenses WHERE id = ?', [id]);
  await query(
    `INSERT INTO audit_logs (id,action,entity,entity_id,details,performed_by,performed_by_role) VALUES (?,?,?,?,?,?,?)`,
    [randomUUID(),'DELETE','expense',id,`Deleted expense ₹${e.amount} — ${e.category}`,session.name,session.role]
  );
  return NextResponse.json({ success: true });
}

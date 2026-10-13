import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { requireSession } from '@/app/lib/admin/session';
import { randomUUID } from 'crypto';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireSession();
  if (error) return error;
  const { id } = await params;
  const [row] = await query('SELECT * FROM eye_tests WHERE id = ?', [id]) as any[];
  if (!row) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  return NextResponse.json({ eyeTest: row });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireSession();
  if (error) return error;
  const { id } = await params;
  const b = await request.json();
  await query(
    `UPDATE eye_tests SET test_date=?, tested_by=?,
     re_sph=?, re_cyl=?, re_axis=?, re_add=?, re_pd=?,
     le_sph=?, le_cyl=?, le_axis=?, le_add=?, le_pd=?,
     visual_acuity_right=?, visual_acuity_left=?, recommendation=?, notes=?
     WHERE id=?`,
    [b.test_date, b.tested_by,
     b.re_sph||null, b.re_cyl||null, b.re_axis||null, b.re_add||null, b.re_pd||null,
     b.le_sph||null, b.le_cyl||null, b.le_axis||null, b.le_add||null, b.le_pd||null,
     b.visual_acuity_right||null, b.visual_acuity_left||null, b.recommendation||null, b.notes||null,
     id]
  );
  await query(
    `INSERT INTO audit_logs (id,action,entity,entity_id,details,performed_by,performed_by_role) VALUES (?,?,?,?,?,?,?)`,
    [randomUUID(), 'UPDATE', 'eye_test', id, `Updated eye test`, session.name, session.role]
  );
  const [updated] = await query('SELECT * FROM eye_tests WHERE id = ?', [id]) as any[];
  return NextResponse.json({ eyeTest: updated });
}

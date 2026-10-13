import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { requireRole } from '@/app/lib/admin/session';
import { validate, supplierUpdateSchema } from '@/app/lib/admin/validation';
import { randomUUID } from 'crypto';

// PUT /api/admin/suppliers/[id]
//
// The suppliers screen has always posted here from its edit dialog, but the
// route did not exist, so saving an edit failed with a 404. Same permissions as
// the collection route: management only.
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireRole('admin', 'manager');
  if (error) return error;

  const { id } = await params;
  const [existing] = (await query('SELECT * FROM suppliers WHERE id = ?', [id])) as any[];
  if (!existing) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  const parsed = validate(supplierUpdateSchema, await request.json());
  if (parsed.error) return parsed.error;

  // Merge only validated keys over the stored row. `balance` is not among them
  // and is left untouched — it is maintained by the purchases flow.
  const s = { ...existing, ...parsed.data };

  await query(
    `UPDATE suppliers SET name=?, contact_person=?, phone=?, email=?, address=?, gst=?, status=?, updated_at=NOW()
     WHERE id=?`,
    [s.name, s.contact_person || null, s.phone, s.email || null, s.address || null, s.gst || null, s.status ?? 'active', id]
  );

  await query(
    `INSERT INTO audit_logs (id,action,entity,entity_id,details,performed_by,performed_by_role) VALUES (?,?,?,?,?,?,?)`,
    [randomUUID(), 'UPDATE', 'supplier', id, `Updated supplier: ${s.name}`, session.name, session.role]
  );

  const [updated] = (await query('SELECT * FROM suppliers WHERE id = ?', [id])) as any[];
  return NextResponse.json({ supplier: updated });
}

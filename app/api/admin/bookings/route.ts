import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { requireSession } from '@/app/lib/admin/session';
import { z } from 'zod';
import { validate } from '@/app/lib/admin/validation';
import { randomUUID } from 'crypto';

// GET /api/admin/bookings
//
// Website enquiries were previously write-only: the public forms saved into
// `appointments` and `inquiries`, but nothing in the admin panel could read them
// back, so the shop only ever saw the notification email. This surfaces both.
export async function GET(request: Request) {
  const { error } = await requireSession();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') ?? 'all';

  let apptSql = 'SELECT * FROM appointments WHERE 1=1';
  const apptParams: any[] = [];
  if (status !== 'all') { apptSql += ' AND status = ?'; apptParams.push(status); }
  apptSql += ' ORDER BY created_at DESC LIMIT 300';

  const [appointments, inquiries] = await Promise.all([
    query(apptSql, apptParams),
    query('SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 300'),
  ]);

  return NextResponse.json({ appointments, inquiries });
}

const updateSchema = z.object({
  kind: z.enum(['appointment', 'inquiry']),
  id: z.coerce.number().int().positive(),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled', 'new', 'contacted', 'closed']),
});

const ALLOWED: Record<string, string[]> = {
  appointment: ['pending', 'confirmed', 'completed', 'cancelled'],
  inquiry: ['new', 'contacted', 'closed'],
};

// PUT /api/admin/bookings — move a booking or enquiry along its workflow.
export async function PUT(request: Request) {
  const { session, error } = await requireSession();
  if (error) return error;

  const parsed = validate(updateSchema, await request.json());
  if (parsed.error) return parsed.error;
  const { kind, id, status } = parsed.data;

  // The two tables have different status vocabularies; don't let one leak into
  // the other and fail the ENUM at the database layer.
  if (!ALLOWED[kind].includes(status)) {
    return NextResponse.json(
      { error: `Status '${status}' is not valid for a ${kind}. Use one of: ${ALLOWED[kind].join(', ')}.` },
      { status: 400 }
    );
  }

  const table = kind === 'appointment' ? 'appointments' : 'inquiries';
  const [existing] = (await query(`SELECT id FROM ${table} WHERE id = ?`, [id])) as any[];
  if (!existing) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  await query(`UPDATE ${table} SET status = ?, updated_at = NOW() WHERE id = ?`, [status, id]);

  await query(
    `INSERT INTO audit_logs (id,action,entity,entity_id,details,performed_by,performed_by_role) VALUES (?,?,?,?,?,?,?)`,
    [randomUUID(), 'UPDATE', kind, String(id), `Marked ${kind} #${id} as ${status}`, session.name, session.role]
  );

  const [row] = (await query(`SELECT * FROM ${table} WHERE id = ?`, [id])) as any[];
  return NextResponse.json({ [kind]: row });
}

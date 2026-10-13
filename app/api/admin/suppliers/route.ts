import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { requireRole } from '@/app/lib/admin/session';
import { validate, supplierCreateSchema } from '@/app/lib/admin/validation';
import { randomUUID } from 'crypto';

export async function GET(request: Request) {
  const { error } = await requireRole('admin', 'manager');
  if (error) return error;
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') ?? 'all';
  let sql = 'SELECT * FROM suppliers WHERE 1=1';
  const params: any[] = [];
  if (status !== 'all') { sql += ' AND status = ?'; params.push(status); }
  sql += ' ORDER BY name';
  return NextResponse.json({ suppliers: await query(sql, params) });
}

export async function POST(request: Request) {
  const { session, error } = await requireRole('admin', 'manager');
  if (error) return error;
  const parsed = validate(supplierCreateSchema, await request.json());
  if (parsed.error) return parsed.error;
  const b = parsed.data;
  const id = randomUUID();
  await query(
    `INSERT INTO suppliers (id,name,contact_person,phone,email,address,gst,status)
     VALUES (?,?,?,?,?,?,?,'active')`,
    [id, b.name, b.contact_person||null, b.phone, b.email||null, b.address||null, b.gst||null]
  );
  await query(
    `INSERT INTO audit_logs (id,action,entity,entity_id,details,performed_by,performed_by_role) VALUES (?,?,?,?,?,?,?)`,
    [randomUUID(),'CREATE','supplier',id,`Added supplier: ${b.name}`,session.name,session.role]
  );
  const [row] = await query('SELECT * FROM suppliers WHERE id = ?', [id]) as any[];
  return NextResponse.json({ supplier: row }, { status: 201 });
}

import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { requireSession } from '@/app/lib/admin/session';
import { randomUUID } from 'crypto';

export async function GET(request: Request) {
  const { error } = await requireSession();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customerId');
  const q = searchParams.get('q') ?? '';

  let sql = 'SELECT * FROM eye_tests WHERE 1=1';
  const params: any[] = [];

  if (customerId) { sql += ' AND customer_id = ?'; params.push(customerId); }
  if (q) {
    sql += ' AND (customer_name LIKE ? OR customer_phone LIKE ?)';
    const like = `%${q}%`;
    params.push(like, like);
  }
  sql += ' ORDER BY test_date DESC, created_at DESC LIMIT 500';

  const rows = await query(sql, params);
  return NextResponse.json({ eyeTests: rows });
}

export async function POST(request: Request) {
  const { session, error } = await requireSession();
  if (error) return error;

  const body = await request.json();
  const customer_id = body.customer_id;
  const customer_name = body.customer_name;
  const customer_phone = body.customer_phone;
  const test_date = body.test_date;
  const tested_by = body.tested_by ?? session.name;

  const re_sph = body.re_sph ?? body.right_eye?.sph;
  const re_cyl = body.re_cyl ?? body.right_eye?.cyl;
  const re_axis = body.re_axis ?? body.right_eye?.axis;
  const re_add = body.re_add ?? body.right_eye?.add;
  const re_pd = body.re_pd ?? body.right_eye?.pd;

  const le_sph = body.le_sph ?? body.left_eye?.sph;
  const le_cyl = body.le_cyl ?? body.left_eye?.cyl;
  const le_axis = body.le_axis ?? body.left_eye?.axis;
  const le_add = body.le_add ?? body.left_eye?.add;
  const le_pd = body.le_pd ?? body.left_eye?.pd;

  const visual_acuity_right = body.visual_acuity_right ?? body.va_right;
  const visual_acuity_left = body.visual_acuity_left ?? body.va_left;
  const recommendation = body.recommendation;
  const notes = body.notes;

  if (!customer_id || !test_date) {
    return NextResponse.json({ error: 'customer_id and test_date are required.' }, { status: 400 });
  }

  const id = randomUUID();
  await query(
    `INSERT INTO eye_tests
       (id, customer_id, customer_name, customer_phone, test_date, tested_by,
        re_sph, re_cyl, re_axis, re_add, re_pd,
        le_sph, le_cyl, le_axis, le_add, le_pd,
        visual_acuity_right, visual_acuity_left, recommendation, notes)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [id, customer_id, customer_name, customer_phone, test_date, tested_by,
     re_sph||null, re_cyl||null, re_axis||null, re_add||null, re_pd||null,
     le_sph||null, le_cyl||null, le_axis||null, le_add||null, le_pd||null,
     visual_acuity_right||null, visual_acuity_left||null,
     recommendation||null, notes||null]
  );

  // Update customer last_visit
  await query('UPDATE customers SET last_visit = NOW() WHERE id = ?', [customer_id]);

  await query(
    `INSERT INTO audit_logs (id, action, entity, entity_id, details, performed_by, performed_by_role)
     VALUES (?, 'CREATE', 'eye_test', ?, ?, ?, ?)`,
    [randomUUID(), id, `New eye test for: ${customer_name}`, session.name, session.role]
  );

  const [row] = await query('SELECT * FROM eye_tests WHERE id = ?', [id]) as any[];
  return NextResponse.json({ eyeTest: row }, { status: 201 });
}

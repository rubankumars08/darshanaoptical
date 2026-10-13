import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { requireRole } from '@/app/lib/admin/session';
import { randomUUID } from 'crypto';

export async function GET(request: Request) {
  const { error } = await requireRole('admin', 'manager');
  if (error) return error;
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to   = searchParams.get('to');
  const category = searchParams.get('category') ?? 'all';

  let sql = 'SELECT * FROM expenses WHERE 1=1';
  const params: any[] = [];
  if (from) { sql += ' AND expense_date >= ?'; params.push(from); }
  if (to)   { sql += ' AND expense_date <= ?'; params.push(to); }
  if (category !== 'all') { sql += ' AND category = ?'; params.push(category); }
  sql += ' ORDER BY expense_date DESC, created_at DESC LIMIT 500';
  return NextResponse.json({ expenses: await query(sql, params) });
}

export async function POST(request: Request) {
  const { session, error } = await requireRole('admin', 'manager');
  if (error) return error;
  const b = await request.json();
  const expense_date = b.expense_date || b.date;
  const rawCat = (b.category || 'other').toLowerCase();
  const allowedCats = ['rent','electricity','salary','transport','maintenance','marketing','supplies','other'];
  const category = allowedCats.includes(rawCat) ? rawCat : 'other';

  const rawMethod = (b.payment_method || 'cash').toLowerCase();
  let payment_method = 'cash';
  if (['cash','upi','card','bank'].includes(rawMethod)) payment_method = rawMethod;
  else if (rawMethod.includes('bank') || rawMethod.includes('transfer')) payment_method = 'bank';
  else if (rawMethod.includes('card')) payment_method = 'card';
  else if (rawMethod.includes('upi')) payment_method = 'upi';

  if (!expense_date || !b.amount || !b.description) {
    return NextResponse.json({ error: 'date, amount, description required.' }, { status: 400 });
  }
  const id = randomUUID();
  await query(
    `INSERT INTO expenses (id,expense_date,category,amount,payment_method,description,reference,created_by)
     VALUES (?,?,?,?,?,?,?,?)`,
    [id, expense_date, category, b.amount, payment_method,
     b.description, b.reference||null, session.name]
  );
  await query(
    `INSERT INTO audit_logs (id,action,entity,entity_id,details,performed_by,performed_by_role) VALUES (?,?,?,?,?,?,?)`,
    [randomUUID(),'CREATE','expense',id,`Expense ₹${b.amount} — ${b.category}: ${b.description}`,session.name,session.role]
  );
  const [row] = await query('SELECT * FROM expenses WHERE id = ?', [id]) as any[];
  return NextResponse.json({ expense: row }, { status: 201 });
}

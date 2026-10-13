import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { requireRole } from '@/app/lib/admin/session';
import { hashPassword, validatePasswordStrength } from '@/app/lib/admin/password';
import { validate, staffCreateSchema, staffUpdateSchema } from '@/app/lib/admin/validation';
import { randomUUID } from 'crypto';

const SELECT_FIELDS = 'id,name,email,role,phone,status,joined_at,last_active';

export async function GET() {
  const { error } = await requireRole('admin');
  if (error) return error;
  const rows = await query(`SELECT ${SELECT_FIELDS} FROM users ORDER BY role, name`);
  return NextResponse.json({ staff: rows });
}

export async function POST(request: Request) {
  const { session, error } = await requireRole('admin');
  if (error) return error;

  const parsed = validate(staffCreateSchema, await request.json());
  if (parsed.error) return parsed.error;
  const b = parsed.data;

  const weak = validatePasswordStrength(b.password);
  if (weak) return NextResponse.json({ error: weak }, { status: 400 });

  const existing = (await query('SELECT id FROM users WHERE email = ? LIMIT 1', [b.email])) as any[];
  if (existing.length) {
    return NextResponse.json({ error: 'A user with that email already exists.' }, { status: 409 });
  }

  const id = randomUUID();
  const password_hash = await hashPassword(b.password);
  await query(
    `INSERT INTO users (id,name,email,password_hash,role,phone,status,joined_at) VALUES (?,?,?,?,?,?,'active',NOW())`,
    [id, b.name, b.email, password_hash, b.role, b.phone || null]
  );
  await query(
    `INSERT INTO audit_logs (id,action,entity,entity_id,details,performed_by,performed_by_role) VALUES (?,?,?,?,?,?,?)`,
    [randomUUID(), 'CREATE', 'user', id, `Created staff: ${b.name} (${b.role})`, session.name, session.role]
  );

  const [row] = (await query(`SELECT ${SELECT_FIELDS} FROM users WHERE id=?`, [id])) as any[];
  return NextResponse.json({ staff: row }, { status: 201 });
}

export async function PUT(request: Request) {
  const { session, error } = await requireRole('admin');
  if (error) return error;

  const parsed = validate(staffUpdateSchema, await request.json());
  if (parsed.error) return parsed.error;
  const b = parsed.data;

  const [target] = (await query('SELECT id,name,role,status FROM users WHERE id=? LIMIT 1', [b.id])) as any[];
  if (!target) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  const nextRole = b.role ?? target.role;
  const nextStatus = b.status ?? target.status;

  // Guard 1: an admin must not be able to lock themselves out mid-session.
  if (target.id === session.userId && (nextRole !== 'admin' || nextStatus !== 'active')) {
    return NextResponse.json(
      { error: 'You cannot change your own role or deactivate your own account.' },
      { status: 400 }
    );
  }

  // Guard 2: never leave the shop with zero active admins.
  if (target.role === 'admin' && target.status === 'active' && (nextRole !== 'admin' || nextStatus !== 'active')) {
    const [{ count }] = (await query(
      "SELECT COUNT(*) AS count FROM users WHERE role='admin' AND status='active'"
    )) as any[];
    if (Number(count) <= 1) {
      return NextResponse.json({ error: 'Cannot remove the last active admin.' }, { status: 400 });
    }
  }

  if (b.password !== undefined) {
    const weak = validatePasswordStrength(b.password);
    if (weak) return NextResponse.json({ error: weak }, { status: 400 });
  }

  // Changing the password, the role, or deactivating the account must invalidate
  // that user's existing cookies — requireSession() compares token_version.
  const revoke =
    b.password !== undefined || nextRole !== target.role || nextStatus !== target.status;

  const sets = ['name=?', 'role=?', 'phone=?', 'status=?', 'updated_at=NOW()'];
  const params: any[] = [b.name ?? target.name, nextRole, b.phone || null, nextStatus];
  if (b.password !== undefined) {
    sets.push('password_hash=?');
    params.push(await hashPassword(b.password));
  }
  if (revoke) sets.push('token_version = token_version + 1');
  params.push(b.id);

  await query(`UPDATE users SET ${sets.join(',')} WHERE id=?`, params);

  await query(
    `INSERT INTO audit_logs (id,action,entity,entity_id,details,performed_by,performed_by_role) VALUES (?,?,?,?,?,?,?)`,
    [
      randomUUID(),
      'UPDATE',
      'user',
      b.id,
      `Updated staff: ${b.name ?? target.name} (role=${nextRole}, status=${nextStatus})` +
        (b.password !== undefined ? ' — password changed' : ''),
      session.name,
      session.role,
    ]
  );

  const [row] = (await query(`SELECT ${SELECT_FIELDS} FROM users WHERE id=?`, [b.id])) as any[];
  return NextResponse.json({ staff: row });
}

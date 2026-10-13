import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { requireSession } from '@/app/lib/admin/session';

export async function GET() {
  const { session, error } = await requireSession();
  if (error) return error;

  const rows = (await query(
    'SELECT id, name, email, role, phone, status, joined_at, last_active FROM users WHERE id = ? LIMIT 1',
    [session.userId]
  )) as any[];
  const user = rows[0];

  // Shaped for the client — deliberately omits the raw session internals (exp, ver).
  return NextResponse.json({
    user: {
      id: session.userId,
      userId: session.userId,
      name: session.name,
      email: session.email,
      role: session.role,
      phone: user?.phone ?? '',
      status: user?.status ?? 'active',
      joinedAt: user?.joined_at ?? '',
      lastActive: user?.last_active ?? null,
    },
  });
}

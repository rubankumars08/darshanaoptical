import { NextResponse } from 'next/server';
import { buildClearedSessionCookie } from '@/app/lib/admin/session';

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(buildClearedSessionCookie());
  return res;
}

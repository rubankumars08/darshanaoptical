import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { requireRole, requireSession } from '@/app/lib/admin/session';
import { validate, settingsUpdateSchema } from '@/app/lib/admin/validation';
import { randomUUID } from 'crypto';

// Readable by any signed-in user — the POS and invoice screens need the shop
// details, tax rate and discount caps to render.
export async function GET() {
  const { error } = await requireSession();
  if (error) return error;
  const [settings] = (await query('SELECT * FROM shop_settings WHERE id=1')) as any[];
  return NextResponse.json({ settings: settings ?? {} });
}

// Admin only: these values include GST details and the discount ceilings that
// the invoice route enforces, so staff must not be able to raise their own cap.
export async function PUT(request: Request) {
  const { session, error } = await requireRole('admin');
  if (error) return error;

  const parsed = validate(settingsUpdateSchema, await request.json());
  if (parsed.error) return parsed.error;

  const [existing] = (await query('SELECT * FROM shop_settings WHERE id=1')) as any[];
  if (!existing) return NextResponse.json({ error: 'Settings row not found.' }, { status: 404 });

  // Merge only the validated keys over the current row.
  const s = { ...existing, ...parsed.data };

  await query(
    `UPDATE shop_settings SET
       shop_name=?,tagline=?,phone=?,whatsapp=?,email=?,address=?,city=?,state=?,pincode=?,gst=?,
       invoice_prefix=?,customer_id_prefix=?,low_stock_threshold=?,tax_enabled=?,tax_rate=?,
       invoice_footer=?,invoice_terms=?,max_discount_admin=?,max_discount_manager=?,max_discount_staff=?
     WHERE id=1`,
    [s.shop_name, s.tagline || null, s.phone, s.whatsapp || null, s.email, s.address, s.city, s.state, s.pincode, s.gst || null,
     s.invoice_prefix, s.customer_id_prefix, s.low_stock_threshold ?? 5, s.tax_enabled ? 1 : 0, s.tax_rate ?? 0,
     s.invoice_footer || null, s.invoice_terms || null, s.max_discount_admin ?? 100, s.max_discount_manager ?? 15, s.max_discount_staff ?? 5]
  );

  await query(
    `INSERT INTO audit_logs (id,action,entity,entity_id,details,performed_by,performed_by_role) VALUES (?,?,?,?,?,?,?)`,
    [randomUUID(), 'UPDATE', 'settings', '1', 'Updated shop settings', session.name, session.role]
  );

  const [updated] = (await query('SELECT * FROM shop_settings WHERE id=1')) as any[];
  return NextResponse.json({ settings: updated });
}

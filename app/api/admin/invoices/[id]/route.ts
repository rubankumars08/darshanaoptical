import { NextResponse } from 'next/server';
import { query, withTransaction } from '@/app/lib/db';
import { requireSession } from '@/app/lib/admin/session';
import { validate, invoiceUpdateSchema } from '@/app/lib/admin/validation';
import { randomUUID } from 'crypto';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireSession();
  if (error) return error;
  const { id } = await params;
  const [invoice] = await query('SELECT * FROM invoices WHERE id = ?', [id]) as any[];
  if (!invoice) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  const items = await query('SELECT * FROM invoice_items WHERE invoice_id = ?', [id]);
  const payments = await query('SELECT * FROM payments WHERE invoice_id = ? ORDER BY created_at', [id]);
  return NextResponse.json({ invoice, items, payments });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, error } = await requireSession();
  if (error) return error;
  const { id } = await params;
  const parsed = validate(invoiceUpdateSchema, await request.json());
  if (parsed.error) return parsed.error;
  const b = parsed.data;

  const [current] = await query('SELECT * FROM invoices WHERE id = ?', [id]) as any[];
  if (!current) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  // A cancelled invoice is closed: no further payments, no order progress.
  if (current.status === 'cancelled' && (b.add_payment || b.order_status !== undefined)) {
    return NextResponse.json({ error: 'This invoice is cancelled and can no longer be modified.' }, { status: 400 });
  }

  // Handle additional payment
  if (b.add_payment) {
    try {
      await withTransaction(async (tx) => {
        // Lock the invoice row so two concurrent payments can't both read the same
        // stale `paid`/`total` and overwrite each other's update (lost update).
        const [locked] = await tx.query('SELECT paid, total, status, invoice_number FROM invoices WHERE id = ? FOR UPDATE', [id]) as any[];
        if (!locked) throw new Error('Not found.');
        if (locked.status === 'cancelled') throw new Error('This invoice is cancelled and can no longer be modified.');

        // Reject overpayment rather than silently clamping the invoice while the
        // payments table still records the full amount — that inflated the
        // collected totals on the reports screen.
        const outstanding = Math.round((parseFloat(locked.total) - parseFloat(locked.paid)) * 100) / 100;
        if (b.add_payment! > outstanding) {
          throw new Error(`Payment of ₹${b.add_payment} exceeds the outstanding balance of ₹${outstanding}.`);
        }

        const newPaid = parseFloat(locked.paid) + b.add_payment!;
        const newBalance = Math.max(0, parseFloat(locked.total) - newPaid);
        const newStatus = newBalance === 0 ? 'paid' : 'partially_paid';

        await tx.query(
          'UPDATE invoices SET paid=?, balance=?, status=?, updated_at=NOW() WHERE id=?',
          [newPaid, newBalance, newStatus, id]
        );
        await tx.query(
          `INSERT INTO payments (id,invoice_id,amount,method,payment_date,notes,received_by) VALUES (?,?,?,?,NOW(),?,?)`,
          [randomUUID(), id, b.add_payment, b.payment_method??'cash', b.payment_notes||null, session.name]
        );
        await tx.query(
          `INSERT INTO audit_logs (id,action,entity,entity_id,details,performed_by,performed_by_role) VALUES (?,?,?,?,?,?,?)`,
          [randomUUID(), 'PAYMENT', 'invoice', id,
           `Payment of ₹${b.add_payment} via ${b.payment_method??'cash'} on invoice ${locked.invoice_number}`,
           session.name, session.role]
        );
      });
    } catch (err: any) {
      return NextResponse.json({ error: err.message ?? 'Failed to record payment.' }, { status: 400 });
    }
  }

  // Handle order status update
  if (b.order_status !== undefined) {
    const deliveredAt = b.order_status === 'delivered' ? 'NOW()' : 'NULL';
    await query(
      `UPDATE invoices SET order_status=?, delivered_at=${deliveredAt}, updated_at=NOW() WHERE id=?`,
      [b.order_status, id]
    );
    await query(
      `INSERT INTO audit_logs (id,action,entity,entity_id,details,performed_by,performed_by_role) VALUES (?,?,?,?,?,?,?)`,
      [randomUUID(), 'UPDATE', 'invoice', id,
       `Order status changed to '${b.order_status}' on invoice ${current.invoice_number}`,
       session.name, session.role]
    );
  }

  // Handle cancellation
  if (b.cancel) {
    if (session.role !== 'admin' && session.role !== 'manager') {
      return NextResponse.json({ error: 'Insufficient permission to cancel.' }, { status: 403 });
    }
    try {
      await withTransaction(async (tx) => {
        // Lock + re-check status so two concurrent cancel requests can't both
        // pass and double-restore stock.
        const [locked] = await tx.query('SELECT status, paid, invoice_number FROM invoices WHERE id = ? FOR UPDATE', [id]) as any[];
        if (!locked) throw new Error('Not found.');
        if (locked.status === 'cancelled') return; // already cancelled — no-op

        // Reverse any money already taken by writing an offsetting refund row, so
        // SUM(payments.amount) for this invoice nets to zero and the payment
        // reports stop counting a cancelled sale as collected.
        const alreadyPaid = parseFloat(locked.paid ?? 0);
        if (alreadyPaid > 0) {
          await tx.query(
            `INSERT INTO payments (id,invoice_id,amount,method,payment_date,notes,received_by) VALUES (?,?,?,?,NOW(),?,?)`,
            [randomUUID(), id, -alreadyPaid, 'cash', `Refund — invoice ${locked.invoice_number} cancelled`, session.name]
          );
        }

        await tx.query(
          "UPDATE invoices SET status='cancelled', order_status='cancelled', paid=0, balance=0, updated_at=NOW() WHERE id=?",
          [id]
        );
        // Restore stock
        const items = await tx.query('SELECT * FROM invoice_items WHERE invoice_id = ?', [id]) as any[];
        for (const item of items) {
          if (item.category !== 'service') {
            await tx.query('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
            await tx.query(
              `INSERT INTO stock_movements (id,product_id,product_name,product_code,type,quantity,reason,reference,created_by)
               VALUES (?,?,?,?,'return',?,?,?,?)`,
              [randomUUID(), item.product_id, item.product_name, item.product_code,
               item.quantity, `Invoice ${locked.invoice_number} cancelled`, locked.invoice_number, session.name]
            );
          }
        }
        await tx.query(
          `INSERT INTO audit_logs (id,action,entity,entity_id,details,performed_by,performed_by_role) VALUES (?,?,?,?,?,?,?)`,
          [randomUUID(), 'CANCEL', 'invoice', id, `Cancelled invoice ${locked.invoice_number}`, session.name, session.role]
        );
      });
    } catch (err: any) {
      return NextResponse.json({ error: err.message ?? 'Failed to cancel invoice.' }, { status: 400 });
    }
  }

  // Handle notes update
  if (b.notes !== undefined && !b.add_payment && !b.cancel && b.order_status === undefined) {
    await query('UPDATE invoices SET notes=?, updated_at=NOW() WHERE id=?', [b.notes, id]);
  }

  const [updated] = await query('SELECT * FROM invoices WHERE id = ?', [id]) as any[];
  const items = await query('SELECT * FROM invoice_items WHERE invoice_id = ?', [id]);
  const payments = await query('SELECT * FROM payments WHERE invoice_id = ? ORDER BY created_at', [id]);
  return NextResponse.json({ invoice: updated, items, payments });
}

'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminFetch } from '@/app/lib/admin/useAdminFetch';
import { adminPut } from '@/app/lib/admin/api';
import AdminLoader from '../../components/AdminLoader';
import TablePagination from '../../components/TablePagination';
import { ArrowLeft, Printer, Plus, CheckCircle, X, FileText, ClipboardList } from 'lucide-react';

function fmt(n: number) { return '₹' + Number(n).toLocaleString('en-IN'); }
function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }

const STATUS_COLORS: Record<string, string> = {
  paid: 'adm-badge-success', partially_paid: 'adm-badge-warning', pending: 'adm-badge-danger', cancelled: 'adm-badge-gray',
  new: 'adm-badge-info', lens_ordered: 'adm-badge-orange', in_process: 'adm-badge-warning', ready: 'adm-badge-success', delivered: 'adm-badge-gray',
};
const STATUS_LABELS: Record<string, string> = {
  paid: 'Paid', partially_paid: 'Partially Paid', pending: 'Pending', cancelled: 'Cancelled',
  new: 'New', lens_ordered: 'Lens Ordered', in_process: 'In Process', ready: 'Ready', delivered: 'Delivered',
};

type PaymentMethod = 'cash' | 'upi' | 'card' | 'bank';

function PrescriptionTable({ test, compact = false }: { test: any; compact?: boolean }) {
  const fields = ['SPH', 'CYL', 'AXIS', 'ADD', 'PD'];
  const rows = [
    ['Right (OD)', test.re_sph, test.re_cyl, test.re_axis, test.re_add, test.re_pd],
    ['Left (OS)', test.le_sph, test.le_cyl, test.le_axis, test.le_add, test.le_pd],
  ];
  return (
    <div className={compact ? 'adm-prescription-table is-compact' : 'adm-prescription-table'}>
      <table>
        <thead><tr><th>Eye</th>{fields.map((field) => <th key={field}>{field}</th>)}</tr></thead>
        <tbody>{rows.map(([eye, ...values]) => <tr key={eye}><td>{eye}</td>{values.map((value, index) => <td key={index}>{value || '—'}</td>)}</tr>)}</tbody>
      </table>
      <div className="adm-prescription-meta">
        <span>VA Right: <strong>{test.visual_acuity_right || '—'}</strong></span>
        <span>VA Left: <strong>{test.visual_acuity_left || '—'}</strong></span>
        <span>Tested by: <strong>{test.tested_by || '—'}</strong></span>
      </div>
      {test.recommendation && <p><strong>Recommendation:</strong> {test.recommendation}</p>}
    </div>
  );
}

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data, loading, error, refetch } = useAdminFetch<{ invoice: any; items: any[]; payments: any[]; settings: any; eyeTest: any | null }>(`/api/admin/invoices/${id}`);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmt, setPayAmt] = useState('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('cash');
  const [payNotes, setPayNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [printMode, setPrintMode] = useState<'invoice' | 'prescription' | 'jobcard' | null>(null);

  if (error) {
    router.replace('/admin/invoices');
    return null;
  }
  if (loading || !data) return <AdminLoader label="Loading invoice" />;

  const { invoice, items, payments, settings, eyeTest } = data;

  const printDocument = (mode: 'invoice' | 'prescription' | 'jobcard') => {
    setPrintMode(mode);
    window.setTimeout(() => {
      window.print();
      setPrintMode(null);
    }, 80);
  };

  const handlePayment = async () => {
    const amount = parseFloat(payAmt);
    if (!amount || amount <= 0) return;
    setSaving(true);
    try {
      await adminPut(`/api/admin/invoices/${id}`, {
        add_payment: amount,
        payment_method: payMethod,
        payment_notes: payNotes || undefined,
      });
      await refetch();
      setShowPayModal(false);
      setPayAmt('');
      setPayNotes('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="adm-print-page" data-print-mode={printMode ?? undefined} style={{ maxWidth: 820 }}>
      <div className="adm-page-header adm-no-print">
        <Link href="/admin/invoices" className="adm-btn adm-btn-ghost adm-btn-sm"><ArrowLeft width={14} height={14} /> Invoices</Link>
        <div style={{ flex: 1 }}>
          <div className="adm-page-title">{invoice.invoice_number}</div>
          <div className="adm-page-sub">{invoice.customer_name} · {fmtDate(invoice.created_at)}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => printDocument('invoice')} className="adm-btn adm-btn-secondary adm-btn-sm"><Printer width={13} height={13} /> Print Bill</button>
          <button onClick={() => printDocument('jobcard')} className="adm-btn adm-btn-secondary adm-btn-sm"><ClipboardList width={13} height={13} /> Job Card</button>
          {eyeTest && <button onClick={() => printDocument('prescription')} className="adm-btn adm-btn-secondary adm-btn-sm"><FileText width={13} height={13} /> Prescription</button>}
          {Number(invoice.balance) > 0 && invoice.status !== 'cancelled' && (
            <button onClick={() => setShowPayModal(true)} className="adm-btn adm-btn-primary adm-btn-sm"><Plus width={13} height={13} /> Receive Payment</button>
          )}
        </div>
      </div>

      {/* Status Row */}
      <div className="adm-no-print" style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <span className={`adm-badge ${STATUS_COLORS[invoice.status]}`}>{STATUS_LABELS[invoice.status]}</span>
        {invoice.order_status && <span className={`adm-badge ${STATUS_COLORS[invoice.order_status]}`}>Order: {STATUS_LABELS[invoice.order_status]}</span>}
        {invoice.delivered_at && <span style={{ fontSize: 12, color: '#64748b' }}>Delivered: {new Date(invoice.delivered_at).toLocaleDateString('en-IN')}</span>}
      </div>

      {/* Invoice Card */}
      <div className="adm-card adm-print-sheet print-section print-invoice" style={{ marginBottom: 16 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Bill To</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{invoice.customer_name}</div>
            <div style={{ color: '#64748b', fontSize: 13.5 }}>{invoice.customer_phone}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{settings?.shop_name || 'Darshana Optical'}</div>
            {settings?.gst && <div style={{ fontSize: 12, color: '#64748b' }}>GSTIN: {settings.gst}</div>}
            <div style={{ fontSize: 12.5, color: '#94a3b8' }}>Harur, Tamil Nadu · 088705 71536</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
              Invoice: <strong>{invoice.invoice_number}</strong><br />
              Date: {new Date(invoice.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Items */}
        <table className="adm-table">
          <thead><tr><th>#</th><th>Item</th><th>Code</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.id}>
                <td style={{ color: '#94a3b8', fontSize: 12 }}>{i + 1}</td>
                <td><div style={{ fontWeight: 600 }}>{item.product_name}</div><div style={{ fontSize: 11.5, color: '#94a3b8', textTransform: 'capitalize' }}>{item.category}</div></td>
                <td style={{ fontFamily: 'monospace', fontSize: 12.5, color: '#64748b' }}>{item.product_code}</td>
                <td style={{ fontWeight: 600 }}>{item.quantity}</td>
                <td>{fmt(item.unit_price)}</td>
                <td style={{ fontWeight: 700 }}>{fmt(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ minWidth: 240, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b' }}><span>Subtotal</span><span>{fmt(invoice.subtotal)}</span></div>
            {Number(invoice.discount_amount) > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#dc2626' }}><span>Discount ({Number(invoice.discount_percent).toFixed(1)}%)</span><span>−{fmt(invoice.discount_amount)}</span></div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 800, borderTop: '2px solid #f1f5f9', paddingTop: 8 }}><span>Total</span><span>{fmt(invoice.total)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#16a34a', fontWeight: 600 }}><span>Paid</span><span>{fmt(invoice.paid)}</span></div>
            {Number(invoice.balance) > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, color: '#d97706' }}><span>Balance Due</span><span>{fmt(invoice.balance)}</span></div>}
          </div>
        </div>
        {(settings?.invoice_terms || settings?.invoice_footer) && (
          <div className="adm-print-footer">
            {settings.invoice_terms && <div><strong>Terms:</strong> {settings.invoice_terms}</div>}
            {settings.invoice_footer && <div>{settings.invoice_footer}</div>}
          </div>
        )}
      </div>

      {eyeTest && (
        <section className="adm-card adm-print-sheet print-section print-only print-prescription">
          <div className="adm-document-header">
            <div><span className="adm-document-kicker">Prescription</span><h1>{eyeTest.customer_name}</h1><p>{eyeTest.customer_phone}</p></div>
            <div className="adm-document-shop"><strong>{settings?.shop_name || 'Darshana Optical'}</strong><span>{settings?.address || 'Harur, Tamil Nadu'}</span><span>{settings?.phone || '88705 71536'}</span></div>
          </div>
          <PrescriptionTable test={eyeTest} />
        </section>
      )}

      <section className="adm-card adm-print-sheet print-section print-only print-jobcard">
        <div className="adm-document-header">
          <div><span className="adm-document-kicker">Job card</span><h1>{invoice.customer_name}</h1><p>{invoice.customer_phone}</p></div>
          <div className="adm-document-shop"><strong>{invoice.invoice_number}</strong><span>{fmtDate(invoice.created_at)}</span><span>Expected: {invoice.expected_date ? new Date(invoice.expected_date).toLocaleDateString('en-IN') : 'Not set'}</span></div>
        </div>
        <div className="adm-job-grid">
          <div><span>Frame</span><strong>{invoice.frame_product || '—'}</strong></div>
          <div><span>Lens</span><strong>{invoice.lens_product || '—'}</strong></div>
          <div><span>Order status</span><strong>{STATUS_LABELS[invoice.order_status] || invoice.order_status || 'New'}</strong></div>
          <div><span>Balance due</span><strong>{fmt(invoice.balance)}</strong></div>
        </div>
        {eyeTest && <PrescriptionTable test={eyeTest} compact />}
        <div className="adm-job-notes"><strong>Work notes</strong><p>{invoice.notes || '________________________________________________________________'}</p></div>
      </section>

      {/* Payments */}
      {payments.length > 0 && (
        <div className="adm-card adm-no-print">
          <div className="adm-card-header"><span className="adm-card-title">Payment History</span></div>
          <div className="adm-table-wrap" style={{ border: 0, borderRadius: 0, boxShadow: 'none' }}>
          <table className="adm-table">
            <thead><tr><th>Date</th><th>Amount</th><th>Method</th><th>Received By</th><th>Notes</th></tr></thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontSize: 12.5 }}>{fmtDate(p.payment_date)}</td>
                  <td style={{ fontWeight: 700, color: '#16a34a' }}>{fmt(p.amount)}</td>
                  <td style={{ textTransform: 'capitalize', color: '#64748b' }}>{p.method}</td>
                  <td style={{ color: '#64748b' }}>{p.received_by}</td>
                  <td style={{ color: '#94a3b8', fontSize: 12.5 }}>{p.notes ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <TablePagination />
        </div>
      )}

      {/* Payment Modal */}
      {showPayModal && (
        <div className="adm-overlay" onClick={() => setShowPayModal(false)}>
          <div className="adm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-header">
              <span className="adm-modal-title">Receive Payment</span>
              <button onClick={() => setShowPayModal(false)} className="adm-btn adm-btn-ghost adm-btn-sm"><X width={14} height={14} /></button>
            </div>
            <div className="adm-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: '12px 14px', background: '#faf8f5', borderRadius: 10, fontSize: 14 }}>
                Outstanding Balance: <strong style={{ color: '#d97706' }}>{fmt(invoice.balance)}</strong>
              </div>
              <div className="adm-field">
                <label className="adm-label">Amount (₹)</label>
                <input className="adm-input" type="number" placeholder={String(invoice.balance)} value={payAmt} onChange={(e) => setPayAmt(e.target.value)} autoFocus />
              </div>
              <div className="adm-field">
                <label className="adm-label">Payment Method</label>
                <select className="adm-select" value={payMethod} onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}>
                  <option value="cash">Cash</option>
                  <option value="upi">UPI / Google Pay</option>
                  <option value="card">Card</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>
              <div className="adm-field">
                <label className="adm-label">Notes</label>
                <input className="adm-input" placeholder="Optional" value={payNotes} onChange={(e) => setPayNotes(e.target.value)} />
              </div>
            </div>
            <div className="adm-modal-footer">
              <button onClick={() => setShowPayModal(false)} className="adm-btn adm-btn-secondary">Cancel</button>
              <button onClick={handlePayment} disabled={saving || !payAmt} className="adm-btn adm-btn-primary">
                {saving ? 'Saving…' : <><CheckCircle width={13} height={13} /> Record Payment</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

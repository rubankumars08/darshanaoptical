'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAdminFetch } from '@/app/lib/admin/useAdminFetch';
import { adminPut } from '@/app/lib/admin/api';
import { CheckCircle } from 'lucide-react';

function fmt(n: number) { return '₹' + Number(n).toLocaleString('en-IN'); }

export default function PaymentsPage() {
  const [selected, setSelected] = useState<any | null>(null);
  const [payAmt, setPayAmt] = useState('');
  const [payMethod, setPayMethod] = useState('cash');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const { data, loading, refetch } = useAdminFetch<{ invoices: any[] }>(
    '/api/admin/invoices', { params: { status: 'pending' } }
  );
  const { data: partData, refetch: refetchPart } = useAdminFetch<{ invoices: any[] }>(
    '/api/admin/invoices', { params: { status: 'partially_paid' } }
  );

  const invoices = [
    ...(data?.invoices ?? []),
    ...(partData?.invoices ?? []),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const totalBalance = invoices.reduce((s, i) => s + Number(i.balance), 0);

  const handlePayment = async () => {
    if (!selected || !payAmt || parseFloat(payAmt) <= 0) { setErr('Enter a valid amount.'); return; }
    setSaving(true); setErr('');
    try {
      await adminPut(`/api/admin/invoices/${selected.id}`, {
        add_payment: parseFloat(payAmt), payment_method: payMethod,
      });
      setSelected(null); setPayAmt(''); refetch(); refetchPart();
    } catch (e: any) { setErr(e.message); }
    setSaving(false);
  };

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <div className="adm-page-title">Payments</div>
          <div className="adm-page-sub">Total Outstanding: <strong style={{ color: '#d97706' }}>{fmt(totalBalance)}</strong></div>
        </div>
      </div>

      {selected && (
        <div style={{ background: '#fffbeb', border: '1px solid #fbbf24', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>
            Record Payment — {selected.invoice_number} ({selected.customer_name})
          </div>
          {err && <div style={{ color: '#ef4444', marginBottom: 8 }}>{err}</div>}
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>
                Amount ₹ (balance: {fmt(selected.balance)})
              </label>
              <input type="number" className="adm-input" style={{ width: 160 }} value={payAmt} onChange={(e) => setPayAmt(e.target.value)} placeholder={String(selected.balance)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Method</label>
              <select className="adm-input" value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
                {['cash', 'upi', 'card', 'bank'].map((m) => <option key={m} value={m}>{m.toUpperCase()}</option>)}
              </select>
            </div>
            <button className="adm-btn adm-btn-primary" disabled={saving} onClick={handlePayment}>
              <CheckCircle size={14} /> {saving ? 'Saving…' : 'Record Payment'}
            </button>
            <button className="adm-btn adm-btn-ghost" onClick={() => { setSelected(null); setPayAmt(''); setErr(''); }}>Cancel</button>
          </div>
        </div>
      )}

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>Invoice</th><th>Customer</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th><th>Date</th><th></th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Loading…</td></tr>
            : invoices.length === 0 ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: '#16a34a' }}>All invoices are fully paid! 🎉</td></tr>
            : invoices.map((inv) => (
              <tr key={inv.id} style={{ background: selected?.id === inv.id ? '#fffbeb' : undefined }}>
                <td><Link href={`/admin/invoices/${inv.id}`} style={{ color: '#fc5a06', fontWeight: 700, textDecoration: 'none' }}>{inv.invoice_number}</Link></td>
                <td>
                  <div style={{ fontWeight: 600 }}>{inv.customer_name}</div>
                  <div style={{ fontSize: 11.5, color: '#94a3b8' }}>{inv.customer_phone}</div>
                </td>
                <td>{fmt(inv.total)}</td>
                <td style={{ color: '#16a34a' }}>{fmt(inv.paid)}</td>
                <td style={{ color: '#d97706', fontWeight: 700 }}>{fmt(inv.balance)}</td>
                <td>
                  <span className={`adm-badge ${inv.status === 'partially_paid' ? 'adm-badge-warning' : 'adm-badge-danger'}`}>
                    {inv.status === 'partially_paid' ? 'Part Paid' : 'Pending'}
                  </span>
                </td>
                <td style={{ fontSize: 12.5, color: '#94a3b8' }}>{new Date(inv.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                <td>
                  <button className="adm-btn adm-btn-primary adm-btn-sm" onClick={() => { setSelected(inv); setPayAmt(String(inv.balance)); setErr(''); }}>
                    <CheckCircle size={12} /> Pay
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

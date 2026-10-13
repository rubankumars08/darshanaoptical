'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAdminFetch } from '@/app/lib/admin/useAdminFetch';
import { Search } from 'lucide-react';

function fmt(n: number) { return '₹' + Number(n).toLocaleString('en-IN'); }
const STATUS_LABELS: Record<string, string> = { paid: 'Paid', partially_paid: 'Part Paid', pending: 'Pending', cancelled: 'Cancelled' };
const STATUS_COLORS: Record<string, string> = { paid: 'adm-badge-success', partially_paid: 'adm-badge-warning', pending: 'adm-badge-danger', cancelled: 'adm-badge-gray' };

export default function InvoicesPage() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const params: Record<string, string> = {};
  if (statusFilter !== 'all') params.status = statusFilter;
  if (query) params.q = query;

  const { data, loading, error } = useAdminFetch<{ invoices: any[] }>('/api/admin/invoices', { params });
  const invoices = data?.invoices ?? [];

  const totalSales = invoices.reduce((s, i) => s + Number(i.total), 0);
  const totalReceived = invoices.reduce((s, i) => s + Number(i.paid), 0);
  const totalPending = invoices.reduce((s, i) => s + Number(i.balance), 0);

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <div className="adm-page-title">Invoices</div>
          <div className="adm-page-sub">{loading ? '…' : `${invoices.length} invoices`}</div>
        </div>
        <Link href="/admin/pos" className="adm-btn adm-btn-primary">+ New Sale</Link>
      </div>

      <div className="adm-grid-3" style={{ marginBottom: 20 }}>
        <div className="adm-stat"><div className="adm-stat-label">Total Value</div><div className="adm-stat-value" style={{ fontSize: 20 }}>{fmt(totalSales)}</div></div>
        <div className="adm-stat"><div className="adm-stat-label">Received</div><div className="adm-stat-value" style={{ fontSize: 20, color: '#16a34a' }}>{fmt(totalReceived)}</div></div>
        <div className="adm-stat"><div className="adm-stat-label">Pending</div><div className="adm-stat-value" style={{ fontSize: 20, color: totalPending > 0 ? '#d97706' : '#94a3b8' }}>{fmt(totalPending)}</div></div>
      </div>

      {error && <div style={{ color: '#ef4444', padding: 12, marginBottom: 12 }}>Error: {error}</div>}

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="adm-search-wrap" style={{ maxWidth: 340 }}>
          <Search />
          <input className="adm-input" placeholder="Search invoice #, customer…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="adm-tabs">
          {(['all', 'paid', 'partially_paid', 'pending', 'cancelled'] as const).map((s) => (
            <button key={s} className={`adm-tab${statusFilter === s ? ' active' : ''}`} onClick={() => setStatusFilter(s)} style={{ fontSize: 12 }}>
              {s === 'all' ? 'All' : STATUS_LABELS[s] ?? s}
            </button>
          ))}
        </div>
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>Invoice #</th><th>Customer</th><th>Items</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th><th>Date</th><th></th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', color: '#94a3b8', padding: 32 }}>Loading…</td></tr>
            ) : invoices.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', color: '#94a3b8', padding: 32 }}>No invoices found.</td></tr>
            ) : invoices.map((inv) => (
              <tr key={inv.id}>
                <td><Link href={`/admin/invoices/${inv.id}`} style={{ color: '#fc5a06', fontWeight: 700, textDecoration: 'none' }}>{inv.invoice_number}</Link></td>
                <td>
                  <div style={{ fontWeight: 600 }}>{inv.customer_name}</div>
                  <div style={{ fontSize: 11.5, color: '#94a3b8' }}>{inv.customer_phone}</div>
                </td>
                <td style={{ color: '#64748b', fontSize: 12.5 }}>—</td>
                <td style={{ fontWeight: 700 }}>{fmt(inv.total)}</td>
                <td style={{ color: '#16a34a', fontWeight: 600 }}>{fmt(inv.paid)}</td>
                <td style={{ color: Number(inv.balance) > 0 ? '#d97706' : '#94a3b8', fontWeight: Number(inv.balance) > 0 ? 700 : 400 }}>{Number(inv.balance) > 0 ? fmt(inv.balance) : '—'}</td>
                <td><span className={`adm-badge ${STATUS_COLORS[inv.status] ?? 'adm-badge-gray'}`}>{STATUS_LABELS[inv.status] ?? inv.status}</span></td>
                <td style={{ fontSize: 12.5, color: '#94a3b8' }}>{new Date(inv.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                <td><Link href={`/admin/invoices/${inv.id}`} className="adm-btn adm-btn-ghost adm-btn-sm">View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

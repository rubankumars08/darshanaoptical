'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAdminFetch } from '@/app/lib/admin/useAdminFetch';
import { adminPut } from '@/app/lib/admin/api';
import { Phone, Search } from 'lucide-react';

type OrderStatus = 'new' | 'lens_ordered' | 'in_process' | 'ready' | 'delivered' | 'cancelled';

const ORDER_STATUSES: OrderStatus[] = ['new', 'lens_ordered', 'in_process', 'ready', 'delivered', 'cancelled'];
const STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'New', lens_ordered: 'Lens Ordered', in_process: 'In Process',
  ready: 'Ready', delivered: 'Delivered', cancelled: 'Cancelled',
};
const STATUS_COLORS: Record<OrderStatus, string> = {
  new: 'adm-badge-info', lens_ordered: 'adm-badge-orange', in_process: 'adm-badge-warning',
  ready: 'adm-badge-success', delivered: 'adm-badge-gray', cancelled: 'adm-badge-danger',
};

export default function OrdersPage() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const { data, loading, refetch } = useAdminFetch<{ orders: any[] }>('/api/admin/orders');
  const allOrders = data?.orders ?? [];

  const orders = allOrders.filter((o) => {
    const matchStatus = statusFilter === 'all' || o.order_status === statusFilter;
    const q = query.toLowerCase();
    const matchQ = !q || o.customer_name?.toLowerCase().includes(q) || o.invoice_number?.toLowerCase().includes(q) || o.customer_phone?.includes(q);
    return matchStatus && matchQ;
  });

  const updateStatus = async (id: string, order_status: OrderStatus) => {
    try {
      await adminPut(`/api/admin/invoices/${id}`, { order_status });
      refetch();
    } catch (e: any) { alert(e.message); }
  };

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <div className="adm-page-title">Orders</div>
          <div className="adm-page-sub">{loading ? '…' : `${orders.length} active orders`}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="adm-search-wrap" style={{ maxWidth: 320 }}>
          <Search />
          <input className="adm-input" placeholder="Search name, phone, invoice…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="adm-tabs">
          {(['all', ...ORDER_STATUSES] as const).map((s) => (
            <button key={s} className={`adm-tab${statusFilter === s ? ' active' : ''}`} onClick={() => setStatusFilter(s as any)} style={{ fontSize: 12 }}>
              {s === 'all' ? 'All' : STATUS_LABELS[s as OrderStatus]}
            </button>
          ))}
        </div>
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>Invoice</th><th>Customer</th><th>Frame / Lens</th><th>Expected</th><th>Status</th><th>Update Status</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Loading…</td></tr>
            : orders.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>No orders found.</td></tr>
            : orders.map((o) => (
              <tr key={o.id}>
                <td><Link href={`/admin/invoices/${o.id}`} style={{ color: '#fc5a06', fontWeight: 700, textDecoration: 'none' }}>{o.invoice_number}</Link></td>
                <td>
                  <div style={{ fontWeight: 600 }}>{o.customer_name}</div>
                  <div style={{ fontSize: 11.5, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Phone size={10} />{o.customer_phone}
                  </div>
                </td>
                <td style={{ fontSize: 12.5, color: '#64748b' }}>
                  {o.frame_product && <div>Frame: {o.frame_product}</div>}
                  {o.lens_product && <div>Lens: {o.lens_product}</div>}
                </td>
                <td style={{ fontSize: 12.5, color: '#64748b' }}>
                  {o.expected_date ? new Date(o.expected_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                </td>
                <td><span className={`adm-badge ${STATUS_COLORS[o.order_status as OrderStatus] ?? 'adm-badge-gray'}`}>{STATUS_LABELS[o.order_status as OrderStatus]}</span></td>
                <td>
                  <select
                    className="adm-input" style={{ fontSize: 12, padding: '4px 8px' }}
                    value={o.order_status}
                    onChange={(e) => updateStatus(o.id, e.target.value as OrderStatus)}
                  >
                    {ORDER_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

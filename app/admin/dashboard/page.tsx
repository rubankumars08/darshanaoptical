'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/lib/admin/auth-context';
import { useAdminFetch } from '@/app/lib/admin/useAdminFetch';
import AdminLoader from '../components/AdminLoader';
import TablePagination from '../components/TablePagination';
import {
  TrendingUp, Eye, AlertTriangle, ArrowRight,
  CheckCircle, Clock, IndianRupee, Receipt, RefreshCw, Zap, UserPlus, CalendarCheck,
} from 'lucide-react';

function fmt(n: number) { return '₹' + Number(n).toLocaleString('en-IN'); }

function Badge({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid: 'adm-badge-success', partially_paid: 'adm-badge-warning',
    pending: 'adm-badge-danger', cancelled: 'adm-badge-gray',
    new: 'adm-badge-info', lens_ordered: 'adm-badge-orange',
    in_process: 'adm-badge-warning', ready: 'adm-badge-success', delivered: 'adm-badge-gray',
  };
  const labels: Record<string, string> = {
    paid: 'Paid', partially_paid: 'Part Paid', pending: 'Pending', cancelled: 'Cancelled',
    new: 'New', lens_ordered: 'Lens Ordered', in_process: 'In Process', ready: 'Ready', delivered: 'Delivered',
  };
  return <span className={`adm-badge ${map[status] ?? 'adm-badge-gray'}`}>{labels[status] ?? status}</span>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, loading, refetch } = useAdminFetch<any>('/api/admin/dashboard');

  if (!user) return null;

  if (loading || !data) return <AdminLoader label="Preparing today's dashboard" />;

  const today = data.today ?? {};
  const month = data.month ?? {};
  const monthExp = data.month_expenses?.total ?? 0;

  return (
    <section className="adm-dashboard">
      {/* Header */}
      <div className="adm-dashboard-welcome">
        <div>
          <h1>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user.name.split(' ')[0]} 👋
          </h1>
          <p>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button onClick={refetch} className="adm-btn adm-btn-ghost adm-btn-sm" title="Refresh">
          <RefreshCw width={14} height={14} />
        </button>
      </div>

      <div className="adm-quick-actions" aria-label="Common tasks">
        <Link href="/admin/counter" className="is-primary"><Zap /> <span>New sale</span></Link>
        <Link href="/admin/customers/new"><UserPlus /> <span>New customer</span></Link>
        <Link href="/admin/eye-tests/new"><Eye /> <span>New eye test</span></Link>
        <Link href="/admin/bookings"><CalendarCheck /> <span>Bookings</span></Link>
      </div>

      {/* Today KPIs */}
      <div className="adm-grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: "Today's sales", value: fmt(today.total ?? 0), sub: `${today.count ?? 0} invoices`, icon: IndianRupee },
          { label: 'Collected today', value: fmt(today.paid ?? 0), sub: `Balance: ${fmt(today.balance ?? 0)}`, icon: CheckCircle },
          { label: 'New customers', value: data.new_customers_today ?? 0, sub: 'registered today', icon: UserPlus },
          { label: "Month's sales", value: fmt(month.total ?? 0), sub: `${month.count ?? 0} invoices`, icon: TrendingUp },
        ].map((k) => (
          <article key={k.label} className="adm-stat adm-dashboard-stat">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div className="adm-stat-label">{k.label}</div>
              <span className="adm-dashboard-stat-icon"><k.icon size={16} /></span>
            </div>
            <div className="adm-stat-value">{k.value}</div>
            <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>{k.sub}</div>
          </article>
        ))}
      </div>

      <div className="adm-grid-2" style={{ marginBottom: 20 }}>
        {/* Pending Orders */}
        <article className="adm-dashboard-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: '#0f172a' }}>
              <Clock size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Pending Orders ({data.pending_orders?.length ?? 0})
            </div>
            <Link href="/admin/orders" style={{ fontSize: 12, color: '#fc5a06', textDecoration: 'none' }}>View all <ArrowRight size={11} style={{ verticalAlign: 'middle' }} /></Link>
          </div>
          {data.pending_orders?.slice(0, 5).map((inv: any) => (
            <div key={inv.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{inv.customer_name}</div>
                <div style={{ fontSize: 11.5, color: '#94a3b8' }}>{inv.invoice_number}</div>
              </div>
              <Badge status={inv.order_status} />
            </div>
          ))}
          {!data.pending_orders?.length && <div className="adm-dashboard-empty">No pending orders</div>}
        </article>

        {/* Low Stock */}
        <article className="adm-dashboard-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: '#0f172a' }}>
              <AlertTriangle size={14} style={{ marginRight: 6, verticalAlign: 'middle', color: '#d97706' }} />
              Low Stock ({(data.low_stock?.length ?? 0) + (data.out_of_stock?.length ?? 0)})
            </div>
            <Link href="/admin/inventory" style={{ fontSize: 12, color: '#fc5a06', textDecoration: 'none' }}>View inventory <ArrowRight size={11} style={{ verticalAlign: 'middle' }} /></Link>
          </div>
          {data.out_of_stock?.slice(0, 3).map((p: any) => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
              <span className="adm-badge adm-badge-danger">Out of stock</span>
            </div>
          ))}
          {data.low_stock?.slice(0, 4).map((p: any) => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
              <span className="adm-badge adm-badge-warning">{p.stock} left</span>
            </div>
          ))}
          {!data.low_stock?.length && !data.out_of_stock?.length && (
            <div className="adm-dashboard-empty">Inventory levels look healthy</div>
          )}
        </article>
      </div>

      {/* Pending Payments */}
      {(data.pending_payments?.length ?? 0) > 0 && (
        <article className="adm-dashboard-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: '#0f172a' }}>
              <Receipt size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Pending Payments ({data.pending_payments.length})
            </div>
            <Link href="/admin/payments" style={{ fontSize: 12, color: '#fc5a06', textDecoration: 'none' }}>View all <ArrowRight size={11} style={{ verticalAlign: 'middle' }} /></Link>
          </div>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>Invoice</th><th>Customer</th><th>Total</th><th>Paid</th><th>Balance</th><th></th></tr></thead>
              <tbody>
                {data.pending_payments.slice(0, 5).map((inv: any) => (
                  <tr key={inv.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#fc5a06', fontWeight: 700 }}>{inv.invoice_number}</td>
                    <td style={{ fontWeight: 600 }}>{inv.customer_name}</td>
                    <td>{fmt(inv.total)}</td>
                    <td style={{ color: '#16a34a' }}>{fmt(inv.paid)}</td>
                    <td style={{ color: '#d97706', fontWeight: 700 }}>{fmt(inv.balance)}</td>
                    <td><Link href={`/admin/invoices/${inv.id}`} className="adm-btn adm-btn-ghost adm-btn-sm">Pay</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <TablePagination />
        </article>
      )}

    </section>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/lib/admin/auth-context';
import { useAdminFetch } from '@/app/lib/admin/useAdminFetch';
import {
  TrendingUp, Users, Eye, ShoppingCart, AlertTriangle, Package, ArrowRight,
  CheckCircle, Clock, IndianRupee, Receipt, RefreshCw, Zap, UserPlus,
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

  if (loading || !data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: '#94a3b8' }}>
        <RefreshCw size={20} style={{ animation: 'spin 0.8s linear infinite', marginRight: 8 }} />
        Loading dashboard…
      </div>
    );
  }

  const today = data.today ?? {};
  const month = data.month ?? {};
  const monthExp = data.month_expenses?.total ?? 0;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user.name.split(' ')[0]} 👋
          </div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <button onClick={refetch} className="adm-btn adm-btn-ghost adm-btn-sm" title="Refresh">
          <RefreshCw width={14} height={14} />
        </button>
      </div>

      {/* Today KPIs */}
      <div className="adm-grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: "Today's Sales", value: fmt(today.total ?? 0), sub: `${today.count ?? 0} invoices`, icon: IndianRupee, color: '#fc5a06' },
          { label: 'Collected Today', value: fmt(today.paid ?? 0), sub: `Balance: ${fmt(today.balance ?? 0)}`, icon: CheckCircle, color: '#16a34a' },
          { label: 'New Customers', value: data.new_customers_today ?? 0, sub: 'registered today', icon: UserPlus, color: '#2563eb' },
          { label: "Month's Sales", value: fmt(month.total ?? 0), sub: `${month.count ?? 0} invoices`, icon: TrendingUp, color: '#7c3aed' },
        ].map((k) => (
          <div key={k.label} className="adm-stat" style={{ borderLeft: `3px solid ${k.color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div className="adm-stat-label">{k.label}</div>
              <k.icon size={16} style={{ color: k.color, opacity: 0.7 }} />
            </div>
            <div className="adm-stat-value" style={{ fontSize: 22, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="adm-grid-2" style={{ marginBottom: 20 }}>
        {/* Pending Orders */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '16px 20px' }}>
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
          {!data.pending_orders?.length && <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: 12 }}>No pending orders 🎉</div>}
        </div>

        {/* Low Stock */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '16px 20px' }}>
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
            <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: 12 }}>All items well-stocked 👍</div>
          )}
        </div>
      </div>

      {/* Pending Payments */}
      {(data.pending_payments?.length ?? 0) > 0 && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '16px 20px' }}>
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
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

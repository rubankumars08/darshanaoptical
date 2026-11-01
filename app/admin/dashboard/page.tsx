'use client';

import Link from 'next/link';
import { useAuth } from '@/app/lib/admin/auth-context';
import { useAdminFetch } from '@/app/lib/admin/useAdminFetch';
import AdminLoader from '../components/AdminLoader';
import TablePagination from '../components/TablePagination';
import { ArrowUpRight, CalendarCheck, Check, Clock3, Eye, IndianRupee, PackageOpen, RefreshCw, ShoppingBag, UserPlus, WalletCards, Zap } from 'lucide-react';

const money = (value: number) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

function Status({ value }: { value: string }) {
  const tone: Record<string, string> = { paid: 'success', partially_paid: 'warning', pending: 'danger', cancelled: 'gray', new: 'info', lens_ordered: 'orange', in_process: 'warning', ready: 'success', delivered: 'gray' };
  const label: Record<string, string> = { partially_paid: 'Part paid', lens_ordered: 'Lens ordered', in_process: 'In process' };
  return <span className={`adm-status adm-status-${tone[value] || 'gray'}`}>{label[value] || value.replaceAll('_', ' ')}</span>;
}

function PanelHeader({ title, count, href, link }: { title: string; count: number; href: string; link: string }) {
  return <div className="adm-dash-panel-head"><div><h2>{title}</h2><span>{count}</span></div><Link href={href}>{link}<ArrowUpRight size={14} /></Link></div>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, loading, refetch } = useAdminFetch<any>('/api/admin/dashboard');
  if (!user) return null;
  if (loading || !data) return <AdminLoader label="Preparing today's dashboard" />;

  const today = data.today ?? {};
  const month = data.month ?? {};
  const stockAlerts = [...(data.out_of_stock || []), ...(data.low_stock || [])];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const metrics = [
    { label: 'Sales today', value: money(today.total), note: `${today.count || 0} invoices`, icon: IndianRupee },
    { label: 'Collected', value: money(today.paid), note: `${money(today.balance)} outstanding`, icon: WalletCards },
    { label: 'New customers', value: data.new_customers_today || 0, note: `${data.total_customers || 0} total customers`, icon: UserPlus },
    { label: 'This month', value: money(month.total), note: `${month.count || 0} invoices`, icon: ShoppingBag },
  ];

  return <section className="adm-dashboard">
    <div className="adm-dash-intro"><div><p>Store overview</p><h1>{greeting}, {user.name.split(' ')[0]}.</h1><span>Here is what needs your attention today.</span></div><button type="button" onClick={refetch} className="adm-refresh"><RefreshCw size={15} /> Refresh</button></div>

    <div className="adm-quick-actions" aria-label="Common tasks">
      <Link href="/admin/counter" className="is-primary"><Zap /> <span>New sale</span></Link>
      <Link href="/admin/customers/new"><UserPlus /> <span>New customer</span></Link>
      <Link href="/admin/eye-tests/new"><Eye /> <span>New eye test</span></Link>
      <Link href="/admin/bookings"><CalendarCheck /> <span>Bookings</span></Link>
    </div>

    <div className="adm-metric-grid" aria-label="Key metrics">{metrics.map(({ label, value, note, icon: Icon }, index) => <article className={`adm-metric${index === 0 ? ' adm-metric-featured' : ''}`} key={label}><div className="adm-metric-top"><span>{label}</span><Icon size={17} /></div><strong>{value}</strong><small>{note}</small></article>)}</div>

    <div className="adm-dash-grid">
      <article className="adm-dash-panel"><PanelHeader title="Orders in progress" count={data.pending_orders?.length || 0} href="/admin/orders" link="View orders" /><div className="adm-dash-list">
        {data.pending_orders?.slice(0, 6).map((item: any) => <Link href={`/admin/invoices/${item.id}`} className="adm-dash-row" key={item.id}><span className="adm-row-icon"><Clock3 size={16} /></span><span className="adm-row-main"><strong>{item.customer_name}</strong><small>{item.invoice_number}</small></span><Status value={item.order_status} /></Link>)}
        {!data.pending_orders?.length && <div className="adm-empty"><Check size={18} /><strong>Orders are up to date</strong><span>Nothing is waiting for processing.</span></div>}
      </div></article>

      <article className="adm-dash-panel"><PanelHeader title="Stock attention" count={stockAlerts.length} href="/admin/inventory" link="Open inventory" /><div className="adm-dash-list">
        {stockAlerts.slice(0, 6).map((item: any, index: number) => <Link href="/admin/inventory" className="adm-dash-row" key={item.id}><span className="adm-row-icon"><PackageOpen size={16} /></span><span className="adm-row-main"><strong>{item.name}</strong><small>{item.brand || item.product_code || 'Product'}</small></span><span className={`adm-status ${index < (data.out_of_stock?.length || 0) ? 'adm-status-danger' : 'adm-status-warning'}`}>{index < (data.out_of_stock?.length || 0) ? 'Out' : `${item.stock} left`}</span></Link>)}
        {!stockAlerts.length && <div className="adm-empty"><Check size={18} /><strong>Stock levels look good</strong><span>No items need replenishment.</span></div>}
      </div></article>
    </div>

    <article className="adm-dash-panel adm-payments-panel"><PanelHeader title="Outstanding payments" count={data.pending_payments?.length || 0} href="/admin/payments" link="View payments" />
      {data.pending_payments?.length ? <><div className="adm-table-wrap adm-dash-table"><table className="adm-table"><thead><tr><th>Invoice</th><th>Customer</th><th>Total</th><th>Received</th><th>Due</th><th /></tr></thead><tbody>{data.pending_payments.slice(0, 6).map((item: any) => <tr key={item.id}><td className="adm-code">{item.invoice_number}</td><td><strong>{item.customer_name}</strong></td><td>{money(item.total)}</td><td>{money(item.paid)}</td><td className="adm-due">{money(item.balance)}</td><td><Link href={`/admin/invoices/${item.id}`} className="adm-row-action">Collect <ArrowUpRight size={13} /></Link></td></tr>)}</tbody></table></div><TablePagination /></> : <div className="adm-empty adm-empty-wide"><Check size={18} /><strong>No outstanding payments</strong><span>Every invoice is settled.</span></div>}
    </article>
  </section>;
}

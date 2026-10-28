'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useAdminFetch } from '@/app/lib/admin/useAdminFetch';
import { adminPut } from '@/app/lib/admin/api';
import {
  ArrowLeft, Eye, ShoppingCart, Phone, Mail, MapPin, Calendar, Edit2, Save, X,
  Receipt, FileText,
} from 'lucide-react';
import TablePagination from '../../components/TablePagination';

function fmt(n: number) { return '₹' + Number(n).toLocaleString('en-IN'); }
function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tab, setTab] = useState<'overview' | 'eyetests' | 'invoices'>('overview');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const { data, loading, refetch } = useAdminFetch<{ customer: any; eyeTests: any[]; invoices: any[] }>(
    `/api/admin/customers/${id}`
  );

  const customer = data?.customer;
  const eyeTests = data?.eyeTests ?? [];
  const invoices = data?.invoices ?? [];

  const openEdit = () => { setEditForm({ ...customer }); setEditing(true); };
  const saveEdit = async () => {
    setSaving(true);
    try {
      await adminPut(`/api/admin/customers/${id}`, editForm);
      setEditing(false); refetch();
    } catch (e: any) { alert(e.message); }
    setSaving(false);
  };

  if (loading) return <div style={{ padding: 32, color: '#94a3b8' }}>Loading customer…</div>;
  if (!customer) return <div style={{ padding: 32, color: '#ef4444' }}>Customer not found.</div>;

  const totalSpent = invoices.reduce((s, i) => s + Number(i.total), 0);
  const totalBalance = invoices.reduce((s, i) => s + Number(i.balance), 0);

  return (
    <div>
      <div className="adm-page-header">
        <Link href="/admin/customers" className="adm-btn adm-btn-ghost adm-btn-sm"><ArrowLeft width={14} height={14} /> Customers</Link>
        <div style={{ flex: 1 }}>
          <div className="adm-page-title">{customer.name}</div>
          <div className="adm-page-sub">{customer.customer_id}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {editing ? (
            <>
              <button className="adm-btn adm-btn-primary adm-btn-sm" disabled={saving} onClick={saveEdit}><Save size={13} /> {saving ? 'Saving…' : 'Save'}</button>
              <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => setEditing(false)}><X size={13} /></button>
            </>
          ) : (
            <button className="adm-btn adm-btn-secondary adm-btn-sm" onClick={openEdit}><Edit2 size={13} /> Edit</button>
          )}
          <Link href={`/admin/eye-tests/new?customerId=${id}&customerName=${encodeURIComponent(customer.name)}&customerPhone=${encodeURIComponent(customer.phone)}`} className="adm-btn adm-btn-ghost adm-btn-sm"><Eye size={13} /> Eye Test</Link>
          <Link href={`/admin/pos?customerId=${id}`} className="adm-btn adm-btn-primary adm-btn-sm"><ShoppingCart size={13} /> New Sale</Link>
        </div>
      </div>

      <div className="adm-grid-2" style={{ gap: 16, marginBottom: 16 }}>
        {/* Profile Card */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Name', key: 'name' }, { label: 'Phone', key: 'phone' },
                { label: 'Email', key: 'email', type: 'email' }, { label: 'Address', key: 'address' },
              ].map(({ label, key, type = 'text' }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 3 }}>{label}</label>
                  <input type={type} className="adm-input" value={editForm[key] ?? ''} onChange={(e) => setEditForm((f: any) => ({ ...f, [key]: e.target.value }))} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 3 }}>Gender</label>
                <select className="adm-input" value={editForm.gender ?? ''} onChange={(e) => setEditForm((f: any) => ({ ...f, gender: e.target.value }))}>
                  <option value="">—</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 3 }}>Notes</label>
                <textarea className="adm-input" rows={2} value={editForm.notes ?? ''} onChange={(e) => setEditForm((f: any) => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fc5a06', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 24 }}>
                  {customer.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>{customer.name}</div>
                  <div style={{ fontSize: 13, color: '#94a3b8', textTransform: 'capitalize' }}>{customer.gender ?? '—'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {customer.phone && <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5 }}><Phone size={14} style={{ color: '#64748b' }} />{customer.phone}</div>}
                {customer.email && <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5 }}><Mail size={14} style={{ color: '#64748b' }} />{customer.email}</div>}
                {customer.dob && <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5 }}><Calendar size={14} style={{ color: '#64748b' }} />DOB: {fmtDate(customer.dob)}</div>}
                {customer.address && <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5 }}><MapPin size={14} style={{ color: '#64748b' }} />{customer.address}</div>}
                {customer.notes && <div style={{ marginTop: 8, background: '#f8fafc', borderRadius: 8, padding: '8px 10px', fontSize: 13, color: '#64748b' }}>{customer.notes}</div>}
              </div>
            </>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'Total Spent', value: fmt(totalSpent), color: '#fc5a06' },
            { label: 'Outstanding Balance', value: fmt(totalBalance), color: totalBalance > 0 ? '#d97706' : '#16a34a' },
            { label: 'Eye Tests', value: eyeTests.length, color: '#2563eb' },
            { label: 'Total Invoices', value: invoices.length, color: '#7c3aed' },
          ].map((s) => (
            <div key={s.label} className="adm-stat" style={{ padding: '12px 16px' }}>
              <div className="adm-stat-label">{s.label}</div>
              <div className="adm-stat-value" style={{ fontSize: 20, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="adm-tabs" style={{ marginBottom: 12 }}>
        {(['overview', 'eyetests', 'invoices'] as const).map((t) => (
          <button key={t} className={`adm-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t === 'eyetests' ? 'Eye Tests' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'eyetests' && (
        <>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>Date</th><th>RE SPH/CYL/AXIS</th><th>LE SPH/CYL/AXIS</th><th>Tested By</th><th>Recommendation</th></tr></thead>
            <tbody>
              {eyeTests.length === 0 ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>No eye tests yet. <Link href={`/admin/eye-tests/new?customerId=${id}&customerName=${encodeURIComponent(customer.name)}&customerPhone=${encodeURIComponent(customer.phone)}`} style={{ color: '#fc5a06' }}>Add one</Link></td></tr>
              : eyeTests.map((t) => (
                <tr key={t.id}>
                  <td>{fmtDate(t.test_date)}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12.5 }}>{[t.re_sph, t.re_cyl, t.re_axis].filter(Boolean).join(' / ') || '—'}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12.5 }}>{[t.le_sph, t.le_cyl, t.le_axis].filter(Boolean).join(' / ') || '—'}</td>
                  <td style={{ fontSize: 12.5, color: '#64748b' }}>{t.tested_by}</td>
                  <td style={{ fontSize: 12.5, color: '#64748b' }}>{t.recommendation ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TablePagination />
        </>
      )}

      {tab === 'invoices' && (
        <>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>Invoice</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th><th>Date</th><th></th></tr></thead>
            <tbody>
              {invoices.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>No invoices yet.</td></tr>
              : invoices.map((inv) => (
                <tr key={inv.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12.5, color: '#fc5a06', fontWeight: 700 }}>{inv.invoice_number}</td>
                  <td>{fmt(inv.total)}</td>
                  <td style={{ color: '#16a34a' }}>{fmt(inv.paid)}</td>
                  <td style={{ color: Number(inv.balance) > 0 ? '#d97706' : '#94a3b8', fontWeight: Number(inv.balance) > 0 ? 700 : 400 }}>{Number(inv.balance) > 0 ? fmt(inv.balance) : '—'}</td>
                  <td><span className={`adm-badge ${inv.status === 'paid' ? 'adm-badge-success' : inv.status === 'partially_paid' ? 'adm-badge-warning' : 'adm-badge-danger'}`}>{inv.status === 'partially_paid' ? 'Part Paid' : inv.status}</span></td>
                  <td style={{ fontSize: 12.5, color: '#94a3b8' }}>{fmtDate(inv.created_at)}</td>
                  <td><Link href={`/admin/invoices/${inv.id}`} className="adm-btn adm-btn-ghost adm-btn-sm">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TablePagination />
        </>
      )}
    </div>
  );
}

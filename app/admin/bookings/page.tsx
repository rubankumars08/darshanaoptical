'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAdminFetch } from '@/app/lib/admin/useAdminFetch';
import { adminPut } from '@/app/lib/admin/api';
import { CalendarCheck, MessageSquare, Phone, Mail, UserPlus } from 'lucide-react';

const APPT_STATUS = ['pending', 'confirmed', 'completed', 'cancelled'];
const INQ_STATUS = ['new', 'contacted', 'closed'];

const BADGE: Record<string, string> = {
  pending: 'adm-badge-warning', confirmed: 'adm-badge-info',
  completed: 'adm-badge-success', cancelled: 'adm-badge-gray',
  new: 'adm-badge-warning', contacted: 'adm-badge-info', closed: 'adm-badge-gray',
};

const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

/** Pre-fills the new-customer form from a website booking. */
function newCustomerHref(b: { name: string; phone: string; email?: string | null }) {
  const p = new URLSearchParams({ name: b.name, phone: b.phone });
  if (b.email) p.set('email', b.email);
  return `/admin/customers/new?${p.toString()}`;
}

export default function BookingsPage() {
  const [tab, setTab] = useState<'appointments' | 'inquiries'>('appointments');
  const { data, loading, refetch } = useAdminFetch<{ appointments: any[]; inquiries: any[] }>('/api/admin/bookings');
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState('');

  const appointments = data?.appointments ?? [];
  const inquiries = data?.inquiries ?? [];

  const setStatus = async (kind: 'appointment' | 'inquiry', id: number, status: string) => {
    setBusy(`${kind}-${id}`);
    setErr('');
    try {
      await adminPut('/api/admin/bookings', { kind, id, status });
      refetch();
    } catch (e: any) {
      setErr(e.message);
    }
    setBusy(null);
  };

  const pendingCount = appointments.filter((a) => a.status === 'pending').length;
  const newCount = inquiries.filter((i) => i.status === 'new').length;

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <div className="adm-page-title">Website Bookings</div>
          <div className="adm-page-sub">
            {loading
              ? '…'
              : `${pendingCount} booking(s) awaiting confirmation · ${newCount} new enquiry(s)`}
          </div>
        </div>
      </div>

      {err && <div style={{ color: '#ef4444', marginBottom: 12, fontSize: 13 }}>{err}</div>}

      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        <button className={`adm-tab${tab === 'appointments' ? ' active' : ''}`} onClick={() => setTab('appointments')}>
          <CalendarCheck size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />
          Eye Test Bookings ({appointments.length})
        </button>
        <button className={`adm-tab${tab === 'inquiries' ? ' active' : ''}`} onClick={() => setTab('inquiries')}>
          <MessageSquare size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />
          Contact Enquiries ({inquiries.length})
        </button>
      </div>

      {tab === 'appointments' ? (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr><th>Customer</th><th>Preferred</th><th>Test</th><th>Glasses</th><th>Received</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Loading…</td></tr>
              : appointments.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>No bookings yet.</td></tr>
              : appointments.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{a.name}</div>
                    <div style={{ fontSize: 11.5, color: '#94a3b8', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span><Phone size={10} style={{ verticalAlign: 'middle' }} /> {a.phone}</span>
                      {a.email && <span><Mail size={10} style={{ verticalAlign: 'middle' }} /> {a.email}</span>}
                    </div>
                    {a.notes && <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 3 }}>{a.notes}</div>}
                  </td>
                  <td style={{ fontSize: 12.5, color: '#64748b' }}>
                    {fmtDate(a.preferred_date)}{a.preferred_time ? ` · ${a.preferred_time}` : ''}
                  </td>
                  <td style={{ fontSize: 12.5 }}>{a.test_type}</td>
                  <td style={{ fontSize: 12.5, color: '#64748b' }}>{a.wears_glasses}</td>
                  <td style={{ fontSize: 12.5, color: '#64748b' }}>{fmtDate(a.created_at)}</td>
                  <td><span className={`adm-badge ${BADGE[a.status] ?? 'adm-badge-gray'}`}>{a.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <select
                        className="adm-input"
                        style={{ width: 130, fontSize: 12 }}
                        value={a.status}
                        disabled={busy === `appointment-${a.id}`}
                        onChange={(e) => setStatus('appointment', a.id, e.target.value)}
                      >
                        {APPT_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {/* Turns a website booking into a real customer record. */}
                      <Link
                        href={newCustomerHref(a)}
                        className="adm-btn adm-btn-ghost adm-btn-sm"
                        title="Create customer from this booking"
                      >
                        <UserPlus size={13} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr><th>From</th><th>Interest</th><th>Message</th><th>Received</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Loading…</td></tr>
              : inquiries.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>No enquiries yet.</td></tr>
              : inquiries.map((i) => (
                <tr key={i.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{i.name}</div>
                    <div style={{ fontSize: 11.5, color: '#94a3b8', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span><Phone size={10} style={{ verticalAlign: 'middle' }} /> {i.phone}</span>
                      {i.email && <span><Mail size={10} style={{ verticalAlign: 'middle' }} /> {i.email}</span>}
                    </div>
                  </td>
                  <td style={{ fontSize: 12.5 }}>{i.interest}</td>
                  <td style={{ fontSize: 12.5, color: '#64748b', maxWidth: 320 }}>{i.message ?? '—'}</td>
                  <td style={{ fontSize: 12.5, color: '#64748b' }}>{fmtDate(i.created_at)}</td>
                  <td><span className={`adm-badge ${BADGE[i.status] ?? 'adm-badge-gray'}`}>{i.status}</span></td>
                  <td>
                    <select
                      className="adm-input"
                      style={{ width: 130, fontSize: 12 }}
                      value={i.status}
                      disabled={busy === `inquiry-${i.id}`}
                      onChange={(e) => setStatus('inquiry', i.id, e.target.value)}
                    >
                      {INQ_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

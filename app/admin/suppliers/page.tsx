'use client';

import { useState } from 'react';
import { useAuth } from '@/app/lib/admin/auth-context';
import { useAdminFetch } from '@/app/lib/admin/useAdminFetch';
import { adminPost, adminPut } from '@/app/lib/admin/api';
import { Plus, X, Edit2, Save } from 'lucide-react';

const BLANK = {
  name: '', contact_person: '', phone: '', email: '', address: '', gst: '', status: 'active',
};

function fmt(n: number) { return '₹' + Number(n).toLocaleString('en-IN'); }

export default function SuppliersPage() {
  const { user } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ ...BLANK });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  // Suppliers are management-only on the server; don't fire a request that will 403.
  const canView = user?.role === 'admin' || user?.role === 'manager';
  const { data, loading, refetch } = useAdminFetch<{ suppliers: any[] }>(canView ? '/api/admin/suppliers' : null);
  const suppliers = data?.suppliers ?? [];

  const handleSave = async () => {
    setSaving(true); setErr('');
    try {
      if (editing) {
        await adminPut(`/api/admin/suppliers/${editing.id}`, form);
        setEditing(null);
      } else {
        await adminPost('/api/admin/suppliers', form);
        setShowAdd(false);
      }
      setForm({ ...BLANK }); refetch();
    } catch (e: any) { setErr(e.message); }
    setSaving(false);
  };

  const canManage = canView;

  if (user && !canView) {
    return <div style={{ padding: 32, color: '#94a3b8', textAlign: 'center' }}>Manager or admin access required to view suppliers.</div>;
  }

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <div className="adm-page-title">Suppliers</div>
          <div className="adm-page-sub">{loading ? '…' : `${suppliers.length} suppliers`}</div>
        </div>
        {canManage && (
          <button className="adm-btn adm-btn-primary" onClick={() => { setShowAdd(true); setEditing(null); setForm({ ...BLANK }); }}>
            <Plus size={14} /> Add Supplier
          </button>
        )}
      </div>

      {(showAdd || editing) && (
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontWeight: 700 }}>{editing ? 'Edit Supplier' : 'Add Supplier'}</div>
            <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => { setShowAdd(false); setEditing(null); }}><X size={14} /></button>
          </div>
          {err && <div style={{ color: '#ef4444', marginBottom: 10 }}>{err}</div>}
          <div className="adm-grid-3" style={{ gap: 12, marginBottom: 12 }}>
            {[
              { label: 'Supplier Name *', key: 'name' },
              { label: 'Contact Person', key: 'contact_person' },
              { label: 'Phone *', key: 'phone' },
              { label: 'Email', key: 'email' },
              { label: 'GST', key: 'gst' },
              { label: 'Address', key: 'address' },
            ].map(({ label, key }) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>{label}</label>
                <input className="adm-input" value={(form as any)[key] ?? ''} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
          </div>
          <button className="adm-btn adm-btn-primary" disabled={saving} onClick={handleSave}>
            <Save size={13} /> {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Supplier'}
          </button>
        </div>
      )}

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>Name</th><th>Contact</th><th>Phone</th><th>GST</th><th>Balance</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Loading…</td></tr>
            : suppliers.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>No suppliers yet.</td></tr>
            : suppliers.map((s) => (
              <tr key={s.id}>
                <td><div style={{ fontWeight: 600 }}>{s.name}</div></td>
                <td style={{ color: '#64748b' }}>{s.contact_person ?? '—'}</td>
                <td>{s.phone}</td>
                <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{s.gst ?? '—'}</td>
                <td style={{ fontWeight: 700, color: Number(s.balance) > 0 ? '#d97706' : '#16a34a' }}>{fmt(s.balance)}</td>
                <td><span className={`adm-badge ${s.status === 'active' ? 'adm-badge-success' : 'adm-badge-gray'}`}>{s.status}</span></td>
                <td>
                  {canManage && (
                    <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => { setEditing(s); setForm({ ...s }); setShowAdd(false); }}><Edit2 size={13} /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

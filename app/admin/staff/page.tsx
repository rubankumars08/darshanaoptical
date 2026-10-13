'use client';

import { useAuth } from '@/app/lib/admin/auth-context';
import { useAdminFetch } from '@/app/lib/admin/useAdminFetch';
import { adminPost, adminPut } from '@/app/lib/admin/api';
import { useState } from 'react';
import { Plus, X, Edit2, Save, Shield } from 'lucide-react';

const BLANK = { name: '', email: '', phone: '', role: 'staff', password: '', status: 'active' };
const ROLE_COLORS: Record<string, string> = { admin: 'adm-badge-danger', manager: 'adm-badge-warning', staff: 'adm-badge-info' };

export default function StaffPage() {
  const { user } = useAuth();
  const { data, loading, refetch } = useAdminFetch<{ staff: any[] }>('/api/admin/staff');
  const staff = data?.staff ?? [];

  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ ...BLANK });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  if (user?.role !== 'admin') {
    return <div style={{ padding: 32, color: '#94a3b8', textAlign: 'center' }}>Admin access required to view staff.</div>;
  }

  const handleSave = async () => {
    setSaving(true); setErr('');
    try {
      if (editing) {
        await adminPut('/api/admin/staff', { id: editing.id, ...form });
        setEditing(null);
      } else {
        if (!form.password) { setErr('Password is required for new staff.'); setSaving(false); return; }
        await adminPost('/api/admin/staff', form);
        setShowAdd(false);
      }
      setForm({ ...BLANK }); refetch();
    } catch (e: any) { setErr(e.message); }
    setSaving(false);
  };

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <div className="adm-page-title">Staff Management</div>
          <div className="adm-page-sub">{loading ? '…' : `${staff.length} staff members`}</div>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={() => { setShowAdd(true); setEditing(null); setForm({ ...BLANK }); }}>
          <Plus size={14} /> Add Staff
        </button>
      </div>

      {(showAdd || editing) && (
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontWeight: 700 }}>{editing ? 'Edit Staff' : 'Add Staff Member'}</div>
            <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => { setShowAdd(false); setEditing(null); }}><X size={14} /></button>
          </div>
          {err && <div style={{ color: '#ef4444', marginBottom: 10 }}>{err}</div>}
          <div className="adm-grid-3" style={{ gap: 12, marginBottom: 12 }}>
            {[
              { label: 'Full Name *', key: 'name' },
              { label: 'Email *', key: 'email', type: 'email' },
              { label: 'Phone', key: 'phone' },
              { label: `Password${editing ? ' (leave blank to keep)' : ' *'}`, key: 'password', type: 'password' },
            ].map(({ label, key, type = 'text' }) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>{label}</label>
                <input type={type} className="adm-input" value={(form as any)[key] ?? ''} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Role *</label>
              <select className="adm-input" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Status</label>
              <select className="adm-input" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <button className="adm-btn adm-btn-primary" disabled={saving} onClick={handleSave}>
            <Save size={13} /> {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Staff'}
          </button>
        </div>
      )}

      <div className="adm-grid-2" style={{ gap: 16 }}>
        {loading ? <div style={{ color: '#94a3b8', padding: 32 }}>Loading…</div>
        : staff.map((s) => (
          <div key={s.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, color: '#fc5a06' }}>
                  {s.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: '#0f172a' }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>{s.email}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span className={`adm-badge ${ROLE_COLORS[s.role] ?? 'adm-badge-gray'}`}><Shield size={10} style={{ marginRight: 3 }} />{s.role}</span>
                <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => { setEditing(s); setForm({ name: s.name, email: s.email, phone: s.phone ?? '', role: s.role, password: '', status: s.status }); setShowAdd(false); }}><Edit2 size={13} /></button>
              </div>
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', display: 'flex', gap: 16 }}>
              <span>Phone: {s.phone || '—'}</span>
              <span>Joined: {new Date(s.joined_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
              {s.last_active && <span>Last active: {new Date(s.last_active).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
            </div>
            <div style={{ marginTop: 8 }}>
              <span className={`adm-badge ${s.status === 'active' ? 'adm-badge-success' : 'adm-badge-gray'}`}>{s.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

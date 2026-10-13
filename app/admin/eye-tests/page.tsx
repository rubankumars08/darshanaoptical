'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/lib/admin/auth-context';
import { useAdminFetch } from '@/app/lib/admin/useAdminFetch';
import { adminPost } from '@/app/lib/admin/api';
import { Search, Plus, X, FileText } from 'lucide-react';

const BLANK = {
  customer_id: '', customer_name: '', customer_phone: '',
  test_date: new Date().toISOString().slice(0, 10), tested_by: '',
  re_sph: '', re_cyl: '', re_axis: '', re_add: '', re_pd: '',
  le_sph: '', le_cyl: '', le_axis: '', le_add: '', le_pd: '',
  visual_acuity_right: '', visual_acuity_left: '', recommendation: '', notes: '',
};

function EyeRow({ label, prefix, form, setForm }: any) {
  const fields = ['sph', 'cyl', 'axis', 'add', 'pd'];
  return (
    <tr>
      <td style={{ fontWeight: 600, fontSize: 12, padding: '6px 8px', color: '#475569' }}>{label}</td>
      {fields.map((f) => (
        <td key={f} style={{ padding: '4px 4px' }}>
          <input className="adm-input" style={{ textAlign: 'center', width: 60 }} value={form[`${prefix}_${f}`] ?? ''}
            onChange={(e) => setForm((x: any) => ({ ...x, [`${prefix}_${f}`]: e.target.value }))} />
        </td>
      ))}
    </tr>
  );
}

export default function EyeTestsPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  // /admin/eye-tests/new redirects here with ?new=1, so open the form directly.
  const sp = useSearchParams();
  const [showAdd, setShowAdd] = useState(sp.get('new') === '1');
  const [form, setForm] = useState({ ...BLANK, tested_by: user?.name ?? '' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const { data, loading, refetch } = useAdminFetch<{ eyeTests: any[] }>('/api/admin/eye-tests');
  const eyeTests = (data?.eyeTests ?? []).filter((t) => {
    const q = query.toLowerCase();
    return !q || t.customer_name?.toLowerCase().includes(q) || t.customer_phone?.includes(q);
  });

  const handleAdd = async () => {
    setSaving(true); setErr('');
    try {
      await adminPost('/api/admin/eye-tests', form);
      setShowAdd(false); setForm({ ...BLANK, tested_by: user?.name ?? '' }); refetch();
    } catch (e: any) { setErr(e.message); }
    setSaving(false);
  };

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <div className="adm-page-title">Eye Tests</div>
          <div className="adm-page-sub">{loading ? '…' : `${eyeTests.length} records`}</div>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={14} /> New Eye Test
        </button>
      </div>

      {showAdd && (
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontWeight: 700 }}>New Eye Test Record</div>
            <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => setShowAdd(false)}><X size={14} /></button>
          </div>
          {err && <div style={{ color: '#ef4444', marginBottom: 10 }}>{err}</div>}
          <div className="adm-grid-3" style={{ gap: 12, marginBottom: 14 }}>
            {[
              { label: 'Customer Name *', key: 'customer_name' },
              { label: 'Phone *', key: 'customer_phone' },
              { label: 'Test Date', key: 'test_date', type: 'date' },
              { label: 'Tested By', key: 'tested_by' },
              { label: 'Right VA', key: 'visual_acuity_right' },
              { label: 'Left VA', key: 'visual_acuity_left' },
            ].map(({ label, key, type = 'text' }) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>{label}</label>
                <input type={type} className="adm-input" value={(form as any)[key] ?? ''} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
          </div>

          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#475569', marginBottom: 8 }}>Prescription</div>
          <div style={{ overflowX: 'auto', marginBottom: 14 }}>
            <table>
              <thead><tr>
                <th style={{ fontSize: 11, padding: '4px 8px' }}></th>
                {['SPH', 'CYL', 'AXIS', 'ADD', 'PD'].map((h) => (
                  <th key={h} style={{ fontSize: 11, fontWeight: 600, padding: '4px 6px', width: 70, textAlign: 'center', color: '#64748b' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                <EyeRow label="Right (RE)" prefix="re" form={form} setForm={setForm} />
                <EyeRow label="Left (LE)" prefix="le" form={form} setForm={setForm} />
              </tbody>
            </table>
          </div>

          <div className="adm-grid-2" style={{ gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Recommendation</label>
              <input className="adm-input" value={form.recommendation} onChange={(e) => setForm((f) => ({ ...f, recommendation: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Notes</label>
              <input className="adm-input" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <button className="adm-btn adm-btn-primary" disabled={saving} onClick={handleAdd}>
            {saving ? 'Saving…' : 'Save Eye Test'}
          </button>
        </div>
      )}

      <div className="adm-search-wrap" style={{ maxWidth: 340, marginBottom: 14 }}>
        <Search />
        <input className="adm-input" placeholder="Search patient name or phone…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>Patient</th><th>Date</th><th>RE (SPH/CYL/AXIS)</th><th>LE (SPH/CYL/AXIS)</th><th>Tested By</th><th>Recommendation</th><th></th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Loading…</td></tr>
            : eyeTests.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>No eye tests found.</td></tr>
            : eyeTests.map((t) => (
              <tr key={t.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{t.customer_name}</div>
                  <div style={{ fontSize: 11.5, color: '#94a3b8' }}>{t.customer_phone}</div>
                </td>
                <td style={{ fontSize: 12.5, color: '#64748b' }}>{new Date(t.test_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                <td style={{ fontFamily: 'monospace', fontSize: 12.5 }}>{[t.re_sph, t.re_cyl, t.re_axis].filter(Boolean).join(' / ') || '—'}</td>
                <td style={{ fontFamily: 'monospace', fontSize: 12.5 }}>{[t.le_sph, t.le_cyl, t.le_axis].filter(Boolean).join(' / ') || '—'}</td>
                <td style={{ fontSize: 12.5, color: '#64748b' }}>{t.tested_by}</td>
                <td style={{ fontSize: 12.5, color: '#64748b' }}>{t.recommendation ?? '—'}</td>
                <td>
                  {/* The printable prescription page existed but nothing linked to it. */}
                  <Link href={`/admin/prescriptions/${t.id}`} className="adm-btn adm-btn-ghost adm-btn-sm" title="Open printable prescription">
                    <FileText size={13} style={{ marginRight: 4 }} /> Prescription
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

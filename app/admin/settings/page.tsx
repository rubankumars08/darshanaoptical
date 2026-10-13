'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/lib/admin/auth-context';
import { useAdminFetch } from '@/app/lib/admin/useAdminFetch';
import { adminPut } from '@/app/lib/admin/api';
import { Save } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const { data, loading, refetch } = useAdminFetch<{ settings: any }>('/api/admin/settings');
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  useEffect(() => {
    if (data?.settings) setForm(data.settings);
  }, [data]);

  const set = (key: string, val: any) => setForm((f: any) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setSaving(true); setErr(''); setOk('');
    try {
      await adminPut('/api/admin/settings', form);
      setOk('Settings saved successfully!');
      refetch();
    } catch (e: any) { setErr(e.message); }
    setSaving(false);
  };

  if (loading) return <div style={{ padding: 32, color: '#94a3b8' }}>Loading settings…</div>;
  if (user?.role !== 'admin') {
    return <div style={{ padding: 32, color: '#94a3b8', textAlign: 'center' }}>Admin access required.</div>;
  }

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, marginBottom: 16 }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', marginBottom: 14, borderBottom: '1px solid #f1f5f9', paddingBottom: 10 }}>{title}</div>
      {children}
    </div>
  );

  const Field = ({ label, k, type = 'text', placeholder = '' }: { label: string; k: string; type?: string; placeholder?: string }) => (
    <div>
      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>{label}</label>
      <input type={type} className="adm-input" placeholder={placeholder} value={form[k] ?? ''} onChange={(e) => set(k, type === 'number' ? +e.target.value : e.target.value)} />
    </div>
  );

  return (
    <div>
      <div className="adm-page-header">
        <div className="adm-page-title">Shop Settings</div>
        <button className="adm-btn adm-btn-primary" disabled={saving} onClick={handleSave}>
          <Save size={14} /> {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
      {err && <div style={{ color: '#ef4444', padding: 12, marginBottom: 12, background: '#fef2f2', borderRadius: 8 }}>{err}</div>}
      {ok && <div style={{ color: '#16a34a', padding: 12, marginBottom: 12, background: '#f0fdf4', borderRadius: 8 }}>{ok}</div>}

      <Section title="Shop Info">
        <div className="adm-grid-3" style={{ gap: 12 }}>
          <Field label="Shop Name" k="shop_name" />
          <Field label="Tagline" k="tagline" />
          <Field label="Phone" k="phone" />
          <Field label="WhatsApp (with country code)" k="whatsapp" placeholder="918870571536" />
          <Field label="Email" k="email" type="email" />
          <Field label="GST Number" k="gst" />
          <Field label="Address" k="address" />
          <Field label="City" k="city" />
          <Field label="State" k="state" />
          <Field label="Pincode" k="pincode" />
        </div>
      </Section>

      <Section title="Invoice Settings">
        <div className="adm-grid-3" style={{ gap: 12 }}>
          <Field label="Invoice Prefix (e.g. DO)" k="invoice_prefix" />
          <Field label="Customer ID Prefix" k="customer_id_prefix" />
          <Field label="Low Stock Threshold" k="low_stock_threshold" type="number" />
          <Field label="Tax Rate %" k="tax_rate" type="number" />
          <div>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Tax Enabled</label>
            <select className="adm-input" value={form.tax_enabled ? '1' : '0'} onChange={(e) => set('tax_enabled', e.target.value === '1')}>
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </div>
        </div>
        <div className="adm-grid-2" style={{ gap: 12, marginTop: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Invoice Footer</label>
            <textarea className="adm-input" rows={2} value={form.invoice_footer ?? ''} onChange={(e) => set('invoice_footer', e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Invoice Terms</label>
            <textarea className="adm-input" rows={2} value={form.invoice_terms ?? ''} onChange={(e) => set('invoice_terms', e.target.value)} />
          </div>
        </div>
      </Section>

      <Section title="Discount Limits by Role">
        <div className="adm-grid-3" style={{ gap: 12 }}>
          <Field label="Admin max discount %" k="max_discount_admin" type="number" />
          <Field label="Manager max discount %" k="max_discount_manager" type="number" />
          <Field label="Staff max discount %" k="max_discount_staff" type="number" />
        </div>
      </Section>
    </div>
  );
}

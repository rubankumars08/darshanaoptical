'use client';

import { useState } from 'react';
import { useAuth } from '@/app/lib/admin/auth-context';
import { useAdminFetch } from '@/app/lib/admin/useAdminFetch';
import { adminPost, adminDelete } from '@/app/lib/admin/api';
import { Plus, X, Trash2 } from 'lucide-react';

function fmt(n: number) { return '₹' + Number(n).toLocaleString('en-IN'); }

const CAT_LABELS: Record<string, string> = {
  rent: 'Rent', electricity: 'Electricity', salary: 'Salary', transport: 'Transport',
  maintenance: 'Maintenance', marketing: 'Marketing', supplies: 'Supplies', other: 'Other',
};
const CAT_COLORS: Record<string, string> = {
  rent: 'adm-badge-danger', electricity: 'adm-badge-warning', salary: 'adm-badge-info',
  transport: 'adm-badge-gray', maintenance: 'adm-badge-orange', marketing: 'adm-badge-success',
  supplies: 'adm-badge-gray', other: 'adm-badge-gray',
};

const BLANK = {
  expense_date: new Date().toISOString().slice(0, 10),
  category: 'rent', amount: '', payment_method: 'cash', description: '', reference: '',
};

export default function ExpensesPage() {
  const { user } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ ...BLANK });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const { data, loading, refetch } = useAdminFetch<{ expenses: any[] }>('/api/admin/expenses');
  const expenses = data?.expenses ?? [];

  const totalAmount = expenses.reduce((s, e) => s + Number(e.amount), 0);

  const handleAdd = async () => {
    setSaving(true); setErr('');
    try {
      await adminPost('/api/admin/expenses', form);
      setShowAdd(false); setForm({ ...BLANK }); refetch();
    } catch (e: any) { setErr(e.message); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this expense?')) return;
    try {
      await adminDelete(`/api/admin/expenses/${id}`);
      refetch();
    } catch (e: any) { alert(e.message); }
  };

  const canDelete = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <div className="adm-page-title">Expenses</div>
          <div className="adm-page-sub">Total: {fmt(totalAmount)}</div>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={14} /> Add Expense
        </button>
      </div>

      {showAdd && (
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontWeight: 700 }}>New Expense</div>
            <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => setShowAdd(false)}><X size={14} /></button>
          </div>
          {err && <div style={{ color: '#ef4444', marginBottom: 10, fontSize: 13 }}>{err}</div>}
          <div className="adm-grid-3" style={{ gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Date</label>
              <input type="date" className="adm-input" value={form.expense_date} onChange={(e) => setForm((f) => ({ ...f, expense_date: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Category</label>
              <select className="adm-input" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                {Object.entries(CAT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Amount ₹</label>
              <input type="number" className="adm-input" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Payment Method</label>
              <select className="adm-input" value={form.payment_method} onChange={(e) => setForm((f) => ({ ...f, payment_method: e.target.value }))}>
                {['cash', 'upi', 'card', 'bank'].map((m) => <option key={m} value={m}>{m.toUpperCase()}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Description *</label>
              <input type="text" className="adm-input" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Reference</label>
              <input type="text" className="adm-input" value={form.reference} onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))} />
            </div>
          </div>
          <button className="adm-btn adm-btn-primary" disabled={saving} onClick={handleAdd}>
            {saving ? 'Saving…' : 'Add Expense'}
          </button>
        </div>
      )}

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>Method</th><th>Description</th><th>By</th><th></th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Loading…</td></tr>
            : expenses.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>No expenses yet.</td></tr>
            : expenses.map((e) => (
              <tr key={e.id}>
                <td style={{ fontSize: 12.5, color: '#64748b' }}>{new Date(e.expense_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                <td><span className={`adm-badge ${CAT_COLORS[e.category] ?? 'adm-badge-gray'}`}>{CAT_LABELS[e.category] ?? e.category}</span></td>
                <td style={{ fontWeight: 700, color: '#0f172a' }}>{fmt(e.amount)}</td>
                <td style={{ textTransform: 'uppercase', fontSize: 12, color: '#64748b' }}>{e.payment_method}</td>
                <td style={{ color: '#334155' }}>{e.description}</td>
                <td style={{ fontSize: 12, color: '#94a3b8' }}>{e.created_by}</td>
                <td>
                  {canDelete && (
                    <button className="adm-btn adm-btn-ghost adm-btn-sm" style={{ color: '#ef4444' }} onClick={() => handleDelete(e.id)}>
                      <Trash2 size={13} />
                    </button>
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

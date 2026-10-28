'use client';

import { useAdminFetch } from '@/app/lib/admin/useAdminFetch';
import { useAuth } from '@/app/lib/admin/auth-context';
import { adminPost, adminPut } from '@/app/lib/admin/api';
import { useState } from 'react';
import { Plus, Save, X } from 'lucide-react';
import TablePagination from '../components/TablePagination';

function fmt(n: number) { return '₹' + Number(n).toLocaleString('en-IN'); }

export default function PurchasesPage() {
  const { user } = useAuth();
  const { data: suppData } = useAdminFetch<{ suppliers: any[] }>('/api/admin/suppliers');
  const { data: prodData } = useAdminFetch<{ products: any[] }>('/api/admin/products');
  const { data, loading, refetch } = useAdminFetch<{ purchases: any[] }>('/api/admin/purchases');
  const purchases = data?.purchases ?? [];
  const suppliers = suppData?.suppliers ?? [];
  const products = prodData?.products ?? [];

  const [showAdd, setShowAdd] = useState(false);
  const [suppId, setSuppId] = useState('');
  const [billNo, setBillNo] = useState('');
  const [amtPaid, setAmtPaid] = useState('');
  const [items, setItems] = useState<any[]>([{ product_id: '', quantity: 1, purchase_price: 0 }]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const addItem = () => setItems((i) => [...i, { product_id: '', quantity: 1, purchase_price: 0 }]);
  const removeItem = (idx: number) => setItems((i) => i.filter((_, j) => j !== idx));
  const setItem = (idx: number, key: string, val: any) =>
    setItems((i) => i.map((it, j) => j === idx ? { ...it, [key]: val } : it));

  const handleSave = async () => {
    const supp = suppliers.find((s) => s.id === suppId);
    if (!suppId || !supp) { setErr('Select a supplier.'); return; }
    const filledItems = items.filter((i) => i.product_id).map((i) => {
      const prod = products.find((p) => p.id === i.product_id);
      return { ...i, product_name: prod?.name, product_code: prod?.product_code };
    });
    if (!filledItems.length) { setErr('Add at least one product.'); return; }
    setSaving(true); setErr('');
    try {
      await adminPost('/api/admin/purchases', {
        supplier_id: suppId, supplier_name: supp.name, supplier_bill_number: billNo,
        items: filledItems, amount_paid: parseFloat(amtPaid) || 0,
      });
      setShowAdd(false); setSuppId(''); setBillNo(''); setAmtPaid('');
      setItems([{ product_id: '', quantity: 1, purchase_price: 0 }]);
      refetch();
    } catch (e: any) { setErr(e.message); }
    setSaving(false);
  };

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <div className="adm-page-title">Purchases</div>
          <div className="adm-page-sub">{loading ? '…' : `${purchases.length} purchase orders`}</div>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={() => setShowAdd(true)}><Plus size={14} /> New Purchase</button>
      </div>

      {showAdd && (
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontWeight: 700 }}>New Purchase Order</div>
            <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => setShowAdd(false)}><X size={14} /></button>
          </div>
          {err && <div style={{ color: '#ef4444', marginBottom: 10 }}>{err}</div>}
          <div className="adm-grid-3" style={{ gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Supplier *</label>
              <select className="adm-input" value={suppId} onChange={(e) => setSuppId(e.target.value)}>
                <option value="">Select supplier…</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Supplier Bill No.</label>
              <input className="adm-input" value={billNo} onChange={(e) => setBillNo(e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Amount Paid ₹</label>
              <input type="number" className="adm-input" value={amtPaid} onChange={(e) => setAmtPaid(e.target.value)} />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Items</div>
            {items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-end' }}>
                <div style={{ flex: 3 }}>
                  <select className="adm-input" value={item.product_id} onChange={(e) => setItem(idx, 'product_id', e.target.value)}>
                    <option value="">Select product…</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.brand}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <input type="number" className="adm-input" placeholder="Qty" value={item.quantity} onChange={(e) => setItem(idx, 'quantity', +e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <input type="number" className="adm-input" placeholder="Price ₹" value={item.purchase_price} onChange={(e) => setItem(idx, 'purchase_price', +e.target.value)} />
                </div>
                <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => removeItem(idx)}><X size={13} /></button>
              </div>
            ))}
            <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={addItem}><Plus size={13} /> Add item</button>
          </div>
          <button className="adm-btn adm-btn-primary" disabled={saving} onClick={handleSave}>
            <Save size={13} /> {saving ? 'Saving…' : 'Create Purchase Order'}
          </button>
        </div>
      )}

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>PO #</th><th>Supplier</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Loading…</td></tr>
            : purchases.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>No purchases yet.</td></tr>
            : purchases.map((p) => (
              <tr key={p.id}>
                <td style={{ fontFamily: 'monospace', fontSize: 12.5, color: '#fc5a06', fontWeight: 700 }}>{p.purchase_number}</td>
                <td style={{ fontWeight: 600 }}>{p.supplier_name}</td>
                <td style={{ fontWeight: 700 }}>{fmt(p.total)}</td>
                <td style={{ color: '#16a34a' }}>{fmt(p.paid)}</td>
                <td style={{ color: Number(p.balance) > 0 ? '#d97706' : '#94a3b8', fontWeight: Number(p.balance) > 0 ? 700 : 400 }}>{Number(p.balance) > 0 ? fmt(p.balance) : '—'}</td>
                <td>
                  <span className={`adm-badge ${p.status === 'paid' ? 'adm-badge-success' : p.status === 'partially_paid' ? 'adm-badge-warning' : 'adm-badge-danger'}`}>{p.status === 'partially_paid' ? 'Part Paid' : p.status.charAt(0).toUpperCase() + p.status.slice(1)}</span>
                </td>
                <td style={{ fontSize: 12.5, color: '#94a3b8' }}>{new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TablePagination />
    </div>
  );
}

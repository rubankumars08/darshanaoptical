'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '@/app/lib/admin/auth-context';
import { useAdminFetch } from '@/app/lib/admin/useAdminFetch';
import { adminPost } from '@/app/lib/admin/api';
import { AlertTriangle, ArrowDownToLine, Package, Plus, X } from 'lucide-react';

function fmt(n: number) { return '₹' + Number(n).toLocaleString('en-IN'); }

const MOVEMENT_LABELS: Record<string, string> = {
  purchase: 'Stock In', sale: 'Sold', damage: 'Damage', return: 'Return', adjustment: 'Adjustment',
};
const MOVEMENT_COLORS: Record<string, string> = {
  purchase: 'adm-badge-success', sale: 'adm-badge-info', damage: 'adm-badge-danger',
  return: 'adm-badge-warning', adjustment: 'adm-badge-gray',
};

const monthStart = () => new Date().toISOString().slice(0, 8) + '01';
const today = () => new Date().toISOString().slice(0, 10);

export default function InventoryPage() {
  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.role === 'manager';

  const [from, setFrom] = useState(monthStart);
  const [to, setTo] = useState(today);
  const [query, setQuery] = useState('');

  const params = useMemo(() => ({ from, to }), [from, to]);
  const { data, loading, refetch } = useAdminFetch<{ products: any[]; movements: any[] }>(
    '/api/admin/inventory', { params }
  );
  const products = data?.products ?? [];
  const movements = data?.movements ?? [];

  // ─── Stock In form ──────────────────────────────────────────
  const [showIn, setShowIn] = useState(false);
  const [form, setForm] = useState({ product_id: '', quantity: '', purchase_price: '', supplier_name: '', reason: '' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const submitStockIn = async () => {
    setSaving(true); setErr('');
    try {
      await adminPost('/api/admin/inventory/stock-in', {
        product_id: form.product_id,
        quantity: form.quantity,
        ...(form.purchase_price ? { purchase_price: form.purchase_price } : {}),
        supplier_name: form.supplier_name || null,
        reason: form.reason || null,
      });
      setForm({ product_id: '', quantity: '', purchase_price: '', supplier_name: '', reason: '' });
      setShowIn(false);
      refetch();
    } catch (e: any) { setErr(e.message); }
    setSaving(false);
  };

  const visible = query
    ? products.filter((p) =>
        [p.name, p.brand, p.product_code].some((v) => String(v ?? '').toLowerCase().includes(query.toLowerCase())))
    : products;

  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= p.low_stock_threshold);
  const outOfStock = products.filter((p) => p.stock === 0);
  const totalValue = products.reduce((s, p) => s + Number(p.stock) * Number(p.purchase_price), 0);
  const totalIn = products.reduce((s, p) => s + Number(p.received ?? 0), 0);
  const totalOut = products.reduce((s, p) => s + Number(p.sold ?? 0), 0);

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <div className="adm-page-title">Stock</div>
          <div className="adm-page-sub">
            {loading ? '…' : `${products.length} products · ${totalIn} came in · ${totalOut} sold in this period`}
          </div>
        </div>
        {canManage && (
          <button className="adm-btn adm-btn-primary" onClick={() => { setShowIn(true); setErr(''); }}>
            <Plus width={14} height={14} /> Stock In
          </button>
        )}
      </div>

      {/* Period + search */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'end', marginBottom: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>From</label>
          <input type="date" className="adm-input" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>To</label>
          <input type="date" className="adm-input" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Search</label>
          <input className="adm-input" placeholder="Name, brand or code…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      {/* Stock In form */}
      {showIn && canManage && (
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ArrowDownToLine size={16} /> Record Stock In
            </div>
            <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => setShowIn(false)}><X size={14} /></button>
          </div>
          {err && <div style={{ color: '#ef4444', marginBottom: 10, fontSize: 13 }}>{err}</div>}

          <div className="adm-grid-3" style={{ gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>Product *</label>
              <select className="adm-input" value={form.product_id}
                onChange={(e) => setForm((f) => ({ ...f, product_id: e.target.value }))}>
                <option value="">Select a product…</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} — {p.brand} ({p.product_code}) · {p.stock} in stock</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>Quantity received *</label>
              <input className="adm-input" type="number" min={1} value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>Cost per unit</label>
              <input className="adm-input" type="number" min={0} placeholder="optional" value={form.purchase_price}
                onChange={(e) => setForm((f) => ({ ...f, purchase_price: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>Supplier</label>
              <input className="adm-input" placeholder="optional" value={form.supplier_name}
                onChange={(e) => setForm((f) => ({ ...f, supplier_name: e.target.value }))} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>Note</label>
              <input className="adm-input" placeholder="optional" value={form.reason}
                onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} />
            </div>
          </div>

          <button className="adm-btn adm-btn-primary" disabled={saving || !form.product_id || !form.quantity}
            onClick={submitStockIn}>
            {saving ? 'Saving…' : 'Add to Stock'}
          </button>
        </div>
      )}

      {/* Summary */}
      <div className="adm-grid-4" style={{ marginBottom: 20 }}>
        <div className="adm-stat">
          <div className="adm-stat-label">Total Products</div>
          <div className="adm-stat-value">{products.length}</div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat-label">Stock Value</div>
          <div className="adm-stat-value" style={{ fontSize: 18, color: '#16a34a' }}>{fmt(totalValue)}</div>
        </div>
        <div className="adm-stat" style={{ borderLeft: '3px solid #d97706' }}>
          <div className="adm-stat-label">Low Stock</div>
          <div className="adm-stat-value" style={{ color: '#d97706' }}>{lowStock.length}</div>
        </div>
        <div className="adm-stat" style={{ borderLeft: '3px solid #ef4444' }}>
          <div className="adm-stat-label">Out of Stock</div>
          <div className="adm-stat-value" style={{ color: '#ef4444' }}>{outOfStock.length}</div>
        </div>
      </div>

      {/* Came in vs sold */}
      <div style={{ fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Package size={16} /> Item movement ({from} → {to})
      </div>
      <div className="adm-table-wrap" style={{ marginBottom: 24 }}>
        <table className="adm-table">
          <thead>
            <tr>
              <th>Product</th><th>Code</th>
              <th style={{ textAlign: 'right' }}>Came In</th>
              <th style={{ textAlign: 'right' }}>Sold</th>
              <th style={{ textAlign: 'right' }}>Returned</th>
              <th style={{ textAlign: 'right' }}>In Stock</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Loading…</td></tr>
            : visible.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>No products found.</td></tr>
            : visible.map((p) => {
              const low = p.stock === 0 ? '#ef4444' : p.stock <= p.low_stock_threshold ? '#d97706' : undefined;
              return (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: 11.5, color: '#94a3b8' }}>{p.brand}</div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12.5, color: '#64748b' }}>{p.product_code}</td>
                  <td style={{ textAlign: 'right', color: '#16a34a', fontWeight: 600 }}>{p.received ? `+${p.received}` : '—'}</td>
                  <td style={{ textAlign: 'right', color: '#2563eb', fontWeight: 600 }}>{p.sold ? `−${p.sold}` : '—'}</td>
                  <td style={{ textAlign: 'right', color: '#64748b' }}>{p.returned || '—'}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: low }}>
                    {p.stock}
                    {low && <AlertTriangle size={12} style={{ marginLeft: 4, verticalAlign: 'middle' }} />}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Recent movements */}
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Recent stock activity</div>
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>Date</th><th>Product</th><th>Type</th><th style={{ textAlign: 'right' }}>Qty</th><th>Reason</th><th>By</th></tr></thead>
          <tbody>
            {movements.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>No stock activity in this period.</td></tr>
            : movements.map((m) => (
              <tr key={m.id}>
                <td style={{ fontSize: 12.5, color: '#64748b' }}>{new Date(m.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                <td style={{ fontSize: 13 }}>{m.product_name}</td>
                <td><span className={`adm-badge ${MOVEMENT_COLORS[m.type] ?? 'adm-badge-gray'}`}>{MOVEMENT_LABELS[m.type] ?? m.type}</span></td>
                <td style={{ textAlign: 'right', fontWeight: 600, color: m.quantity > 0 ? '#16a34a' : '#ef4444' }}>
                  {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                </td>
                <td style={{ fontSize: 12.5, color: '#64748b' }}>{m.reason ?? '—'}</td>
                <td style={{ fontSize: 12.5, color: '#64748b' }}>{m.created_by}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

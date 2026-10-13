'use client';

import { useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/lib/admin/auth-context';
import { useAdminFetch } from '@/app/lib/admin/useAdminFetch';
import { adminPost, adminPut } from '@/app/lib/admin/api';
import { Plus, Edit2, X, Save, Upload, Trash2, Loader2, Search, Image as ImageIcon } from 'lucide-react';

function fmt(n: number) { return '₹' + Number(n).toLocaleString('en-IN'); }

const CAT_LABELS: Record<string, string> = {
  frame: 'Frame', lens: 'Lens', sunglass: 'Sunglass', accessory: 'Accessory', service: 'Service',
};

const BLANK_PRODUCT = {
  name: '', brand: '', model: '', category: 'frame', color: '', size: '', material: '',
  purchase_price: 0, selling_price: 0, mrp: 0, stock: 0, low_stock_threshold: 5,
  image_url: '', description: '', status: 'active',
};

export default function ProductsPage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [query, setQuery] = useState('');
  // /admin/products/frames|lenses|sunglasses redirect here with ?cat=, so honour
  // it as the initial filter — previously the parameter was silently ignored.
  const searchParams = useSearchParams();
  const [catFilter, setCatFilter] = useState(() => {
    const c = searchParams.get('cat');
    return c && CAT_LABELS[c] ? c : 'all';
  });
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ ...BLANK_PRODUCT });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');

  const params: Record<string, string> = {};
  if (catFilter !== 'all') params.category = catFilter;
  if (query) params.q = query;

  const { data, loading, refetch } = useAdminFetch<{ products: any[] }>('/api/admin/products', { params });
  const products = data?.products ?? [];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErr('File size must be less than 5MB.');
      return;
    }

    setUploading(true);
    setErr('');
    try {
      const fd = new FormData();
      fd.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: fd,
      });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || 'Upload failed');

      setForm((f) => ({ ...f, image_url: json.url }));
    } catch (e: any) {
      setErr(e.message || 'Image upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAdd = async () => {
    setSaving(true); setErr('');
    try {
      await adminPost('/api/admin/products', form);
      setShowAdd(false); setForm({ ...BLANK_PRODUCT }); refetch();
    } catch (e: any) { setErr(e.message); }
    setSaving(false);
  };

  const handleEdit = async () => {
    if (!editing) return;
    setSaving(true); setErr('');
    try {
      await adminPut(`/api/admin/products/${editing.id}`, form);
      setEditing(null); refetch();
    } catch (e: any) { setErr(e.message); }
    setSaving(false);
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setForm({
      ...BLANK_PRODUCT,
      ...p,
      image_url: p.image_url || '',
    });
    setShowAdd(false);
  };

  const canManage = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <div className="adm-page-title">Products Catalog</div>
          <div className="adm-page-sub">{loading ? '…' : `${products.length} optical products listed`}</div>
        </div>
        {canManage && (
          <button className="adm-btn adm-btn-primary" onClick={() => { setShowAdd(true); setEditing(null); setForm({ ...BLANK_PRODUCT }); }}>
            <Plus width={14} height={14} /> Add Product
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="adm-search-wrap" style={{ maxWidth: 320 }}>
          <Search />
          <input className="adm-input" placeholder="Search name, brand, code…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="adm-tabs">
          {(['all', 'frame', 'lens', 'sunglass', 'accessory', 'service'] as const).map((c) => (
            <button key={c} className={`adm-tab${catFilter === c ? ' active' : ''}`} onClick={() => setCatFilter(c)}>
              {c === 'all' ? 'All' : CAT_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      {/* Add/Edit Panel with Image Upload */}
      {(showAdd || editing) && (
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#0f172a' }}>{editing ? 'Edit Product & Image' : 'Add New Optical Product'}</div>
            <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => { setShowAdd(false); setEditing(null); }}><X size={16} /></button>
          </div>
          {err && <div style={{ color: '#ef4444', background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{err}</div>}

          {/* Image Upload & Preview Section */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16, marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Product Image
            </label>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Image Preview Box */}
              <div style={{
                width: 110,
                height: 110,
                borderRadius: 12,
                border: '2px dashed #cbd5e1',
                background: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
              }}>
                {form.image_url ? (
                  <img
                    src={form.image_url}
                    alt="Product preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={() => setErr('Failed to render image from provided URL.')}
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                    <ImageIcon size={32} style={{ margin: '0 auto 4px', display: 'block' }} />
                    <span style={{ fontSize: 10, fontWeight: 600 }}>No Image</span>
                  </div>
                )}
                {uploading && (
                  <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.85)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: '#fc5a06' }} />
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    className="adm-btn adm-btn-primary adm-btn-sm"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={14} /> {uploading ? 'Uploading…' : 'Upload Image File'}
                  </button>
                  {form.image_url && (
                    <button
                      type="button"
                      className="adm-btn adm-btn-danger adm-btn-sm"
                      onClick={() => setForm((f) => ({ ...f, image_url: '' }))}
                      title="Remove image"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>or Image URL:</span>
                  <input
                    type="text"
                    className="adm-input"
                    placeholder="https://... or /images/..."
                    value={form.image_url}
                    onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                    style={{ height: 34, fontSize: 12.5 }}
                  />
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                  Supports JPG, PNG, WebP up to 5MB. Images are stored securely on the server.
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="adm-grid-3" style={{ gap: 14, marginBottom: 16 }}>
            {[
              { label: 'Product Name *', key: 'name', type: 'text', placeholder: 'e.g. Ray-Ban Wayfarer Classic' },
              { label: 'Brand *', key: 'brand', type: 'text', placeholder: 'e.g. Ray-Ban, Zeiss, Vogue' },
              { label: 'Model Number', key: 'model', type: 'text', placeholder: 'e.g. RB2140' },
              { label: 'Color / Finish', key: 'color', type: 'text', placeholder: 'e.g. Matte Black / Tortoise' },
              { label: 'Frame Size', key: 'size', type: 'text', placeholder: 'e.g. Medium (50-22-150)' },
              { label: 'Material', key: 'material', type: 'text', placeholder: 'e.g. Acetate, Titanium' },
              { label: 'Purchase Cost ₹', key: 'purchase_price', type: 'number', placeholder: '0.00' },
              { label: 'Selling Price ₹ *', key: 'selling_price', type: 'number', placeholder: '0.00' },
              { label: 'MRP ₹', key: 'mrp', type: 'number', placeholder: '0.00' },
              { label: 'Initial Stock Qty', key: 'stock', type: 'number', placeholder: '0' },
              { label: 'Low Stock Alert Threshold', key: 'low_stock_threshold', type: 'number', placeholder: '5' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>{label}</label>
                <input
                  type={type}
                  className="adm-input"
                  placeholder={placeholder}
                  value={(form as any)[key] ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: type === 'number' ? +e.target.value : e.target.value }))}
                />
              </div>
            ))}
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>Category *</label>
              <select className="adm-input" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                {Object.entries(CAT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#475569', marginBottom: 4 }}>Description / Optical Features</label>
            <textarea
              className="adm-input"
              rows={2}
              placeholder="e.g. Anti-glare coating, spring hinges, polarized lenses..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          <button className="adm-btn adm-btn-primary" disabled={saving || uploading} onClick={editing ? handleEdit : handleAdd}>
            <Save size={14} /> {saving ? 'Saving Product…' : editing ? 'Save Product Changes' : 'Create Product'}
          </button>
        </div>
      )}

      {/* Products Table with Image Column */}
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th style={{ width: 64 }}>Image</th>
              <th>Code</th>
              <th>Product Details</th>
              <th>Category</th>
              <th>Cost Price</th>
              <th>Selling Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th style={{ width: 60 }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Loading product catalog…</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No products found matching your search.</td></tr>
            ) : products.map((p) => (
              <tr key={p.id}>
                {/* Image Thumbnail */}
                <td>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 8,
                    background: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}>
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <ImageIcon size={18} style={{ color: '#cbd5e1' }} />
                    )}
                  </div>
                </td>
                <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#64748b' }}>{p.product_code}</td>
                <td>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    {p.brand}{p.model ? ` · ${p.model}` : ''}{p.color ? ` (${p.color})` : ''}
                  </div>
                </td>
                <td><span className="adm-badge adm-badge-info">{CAT_LABELS[p.category] || p.category}</span></td>
                <td style={{ color: '#64748b', fontSize: 13 }}>{fmt(p.purchase_price)}</td>
                <td style={{ fontWeight: 700, color: '#0f172a' }}>{fmt(p.selling_price)}</td>
                <td>
                  <span style={{
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 12,
                    fontSize: 12,
                    background: p.stock === 0 ? '#fef2f2' : p.stock <= p.low_stock_threshold ? '#fffbeb' : '#f0fdf4',
                    color: p.stock === 0 ? '#dc2626' : p.stock <= p.low_stock_threshold ? '#d97706' : '#16a34a',
                  }}>
                    {p.stock} in stock
                  </span>
                </td>
                <td>
                  <span className={`adm-badge ${p.status === 'active' ? 'adm-badge-success' : 'adm-badge-gray'}`}>
                    {p.status}
                  </span>
                </td>
                <td>
                  {canManage && (
                    <button
                      className="adm-btn adm-btn-ghost adm-btn-sm"
                      onClick={() => openEdit(p)}
                      title="Edit Product & Image"
                    >
                      <Edit2 size={13} />
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

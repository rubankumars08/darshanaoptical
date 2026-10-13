'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/lib/admin/auth-context';
import { useAdminFetch } from '@/app/lib/admin/useAdminFetch';
import { adminPost } from '@/app/lib/admin/api';
import { Search, Plus, Trash2, ShoppingCart, CheckCircle, X } from 'lucide-react';
import Link from 'next/link';

function fmt(n: number) { return '₹' + Number(n).toLocaleString('en-IN'); }

function POSContent() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useSearchParams();

  const [step, setStep] = useState<'customer' | 'products' | 'payment' | 'done'>('customer');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [selectedEyeTest, setSelectedEyeTest] = useState<any | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [productTab, setProductTab] = useState<'all' | 'frame' | 'lens' | 'sunglass' | 'service'>('all');
  const [cart, setCart] = useState<any[]>([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [notes, setNotes] = useState('');
  const [hasOrder, setHasOrder] = useState(true);
  const [expectedDate, setExpectedDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 3);
    return d.toISOString().slice(0, 10);
  });
  const [frameProduct, setFrameProduct] = useState('');
  const [lensProduct, setLensProduct] = useState('');
  const [createdInvoiceNumber, setCreatedInvoiceNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  // Load customers and products from DB
  const { data: custData } = useAdminFetch<{ customers: any[] }>('/api/admin/customers', { params: { status: 'active' } });
  const { data: prodData } = useAdminFetch<{ products: any[] }>('/api/admin/products', { params: { status: 'active' } });
  const customers = custData?.customers ?? [];
  const allProducts = prodData?.products ?? [];

  // Filter customer eye tests
  const { data: eyeTestData } = useAdminFetch<{ eyeTests: any[] }>(
    selectedCustomer ? '/api/admin/eye-tests' : null,
    { params: selectedCustomer ? { customerId: selectedCustomer.id } : {} }
  );
  const eyeTests = eyeTestData?.eyeTests ?? [];

  // Pre-select customer from URL param
  useEffect(() => {
    const cid = params.get('customerId');
    if (cid && customers.length) {
      const c = customers.find((c) => c.id === cid);
      if (c) { setSelectedCustomer(c); setStep('products'); }
    }
  }, [params, customers]);

  // Customer search
  const customerResults = customerSearch.length >= 1
    ? customers.filter((c) => {
        const q = customerSearch.toLowerCase();
        return c.name?.toLowerCase().includes(q) || c.phone?.includes(q) || c.customer_id?.toLowerCase().includes(q);
      }).slice(0, 8)
    : [];

  // Product filter
  const displayedProducts = allProducts.filter((p) => {
    const matchCat = productTab === 'all' || p.category === productTab;
    const q = productSearch.toLowerCase();
    const matchQ = !q || p.name?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q);
    return matchCat && matchQ && p.stock > 0;
  });

  // Cart operations
  const addToCart = (product: any) => {
    setCart((c) => {
      const existing = c.find((i) => i.product_id === product.id);
      if (existing) {
        return c.map((i) => i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...c, {
        product_id: product.id, product_name: product.name,
        product_code: product.product_code, category: product.category,
        quantity: 1, unit_price: Number(product.selling_price), discount: 0,
      }];
    });
  };

  const removeFromCart = (product_id: string) => setCart((c) => c.filter((i) => i.product_id !== product_id));
  const updateQty = (product_id: string, qty: number) =>
    qty < 1 ? removeFromCart(product_id) : setCart((c) => c.map((i) => i.product_id === product_id ? { ...i, quantity: qty } : i));

  // Totals
  const subtotal = cart.reduce((s, i) => s + i.unit_price * i.quantity - (i.discount ?? 0), 0);
  const discountAmount = subtotal * (discountPercent / 100);
  const total = Math.round((subtotal - discountAmount) * 100) / 100;
  const paid = Math.min(parseFloat(amountPaid) || 0, total);
  const balance = Math.round((total - paid) * 100) / 100;

  const handleSubmit = async () => {
    if (!selectedCustomer || !cart.length) return;
    setSaving(true); setErr('');
    try {
      const result = await adminPost<any>('/api/admin/invoices', {
        customer_id: selectedCustomer.id,
        customer_name: selectedCustomer.name,
        customer_phone: selectedCustomer.phone,
        eye_test_id: selectedEyeTest?.id ?? null,
        items: cart,
        discount_percent: discountPercent,
        payment_method: paymentMethod,
        amount_paid: paid,
        notes, has_order: hasOrder,
        expected_date: hasOrder ? expectedDate : null,
        frame_product: frameProduct || null,
        lens_product: lensProduct || null,
      });
      setCreatedInvoiceNumber(result.invoice_number);
      setStep('done');
    } catch (e: any) {
      setErr(e.message ?? 'Failed to create invoice.');
    }
    setSaving(false);
  };

  // ─── STEP: DONE ───────────────────────────────────────────────
  if (step === 'done') {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <CheckCircle size={60} style={{ color: '#16a34a', marginBottom: 16 }} />
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Invoice Created!</h2>
        <p style={{ color: '#64748b', marginBottom: 24 }}>
          Invoice <strong style={{ color: '#fc5a06' }}>{createdInvoiceNumber}</strong> for <strong>{selectedCustomer?.name}</strong> — {fmt(total)}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="adm-btn adm-btn-primary" onClick={() => {
            setStep('customer'); setSelectedCustomer(null); setCart([]); setAmountPaid(''); setDiscountPercent(0); setErr('');
          }}>New Sale</button>
          <Link href="/admin/invoices" className="adm-btn adm-btn-secondary">View Invoices</Link>
          <Link href="/admin/orders" className="adm-btn adm-btn-ghost">View Orders</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="adm-page-header">
        <div className="adm-page-title">Point of Sale</div>
        <div className="adm-stepper">
          {(['customer', 'products', 'payment'] as const).map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {i > 0 && <div style={{ width: 20, height: 1, background: '#e2e8f0' }} />}
              <div style={{
                padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                background: step === s ? '#fc5a06' : s === 'products' && step === 'payment' ? '#e2e8f0' : step === 'customer' ? '#f1f5f9' : '#e2e8f0',
                color: step === s ? 'white' : '#94a3b8',
              }}>{i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}</div>
            </div>
          ))}
        </div>
      </div>

      {err && <div style={{ color: '#ef4444', marginBottom: 12, padding: 12, background: '#fef2f2', borderRadius: 8 }}>{err}</div>}

      {/* ─── STEP 1: CUSTOMER ─── */}
      {step === 'customer' && (
        <div style={{ maxWidth: 560 }}>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
            <div style={{ fontWeight: 700, marginBottom: 14 }}>Select Customer</div>
            <div className="adm-search-wrap" style={{ marginBottom: 10 }}>
              <Search />
              <input className="adm-input" placeholder="Search by name, phone, customer ID…"
                value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} autoFocus />
            </div>
            {customerResults.length > 0 && (
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
                {customerResults.map((c) => (
                  <div key={c.id} style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    onClick={() => { setSelectedCustomer(c); setStep('products'); }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>{c.phone} · {c.customer_id}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>New patient?</span>
              <Link href="/admin/customers/new" className="adm-btn adm-btn-ghost adm-btn-sm"><Plus size={13} /> Create Customer</Link>
            </div>
          </div>
        </div>
      )}

      {/* ─── STEP 2: PRODUCTS ─── */}
      {step === 'products' && selectedCustomer && (
        <div className="adm-grid-2" style={{ gap: 16 }}>
          {/* Left: Product Picker */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Products</div>
            <div className="adm-search-wrap" style={{ marginBottom: 8 }}>
              <Search />
              <input className="adm-input" placeholder="Search products…" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} />
            </div>
            <div className="adm-tabs" style={{ marginBottom: 10 }}>
              {(['all', 'frame', 'lens', 'sunglass', 'service'] as const).map((t) => (
                <button key={t} className={`adm-tab${productTab === t ? ' active' : ''}`} onClick={() => setProductTab(t)} style={{ fontSize: 11.5 }}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <div style={{ maxHeight: 380, overflowY: 'auto' }}>
              {displayedProducts.map((p) => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                  onClick={() => addToCart(p)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 6, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                      {p.image_url ? (
                        <img src={p.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: 12 }}>👓</span>
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                      <div style={{ fontSize: 11.5, color: '#94a3b8' }}>{p.brand} · Stock: {p.stock}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{fmt(p.selling_price)}</span>
                    <Plus size={14} style={{ color: '#fc5a06' }} />
                  </div>
                </div>
              ))}
              {displayedProducts.length === 0 && <div style={{ color: '#94a3b8', textAlign: 'center', padding: 24 }}>No products found.</div>}
            </div>
          </div>

          {/* Right: Cart */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontWeight: 700 }}>
                <ShoppingCart size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                Cart — {selectedCustomer.name}
              </div>
              <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => setStep('customer')}>Change Customer</button>
            </div>

            {/* Eye Test */}
            {eyeTests.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>Link Prescription</label>
                <select className="adm-input" value={selectedEyeTest?.id ?? ''} onChange={(e) => setSelectedEyeTest(eyeTests.find((t) => t.id === e.target.value) ?? null)}>
                  <option value="">No prescription</option>
                  {eyeTests.map((t) => <option key={t.id} value={t.id}>{new Date(t.test_date).toLocaleDateString('en-IN')} — {t.tested_by}</option>)}
                </select>
              </div>
            )}

            {/* Cart Items */}
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: 24 }}>No items added yet</div>
            ) : (
              <>
                {cart.map((item) => (
                  <div key={item.product_id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 12.5 }}>{item.product_name}</div>
                    </div>
                    <input type="number" style={{ width: 48, textAlign: 'center', padding: '4px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 12 }}
                      value={item.quantity} min={1} onChange={(e) => updateQty(item.product_id, +e.target.value)} />
                    <span style={{ width: 70, textAlign: 'right', fontWeight: 600, fontSize: 13 }}>{fmt(item.unit_price * item.quantity)}</span>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }} onClick={() => removeFromCart(item.product_id)}><X size={14} /></button>
                  </div>
                ))}
                <div style={{ marginTop: 10 }}>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b' }}>Discount %</label>
                  <input type="number" className="adm-input" style={{ width: 80 }} min={0} max={100} value={discountPercent}
                    onChange={(e) => setDiscountPercent(Math.min(+e.target.value, 100))} />
                </div>
                <div style={{ marginTop: 10, borderTop: '2px solid #f1f5f9', paddingTop: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}><span style={{ color: '#64748b' }}>Subtotal</span><span>{fmt(subtotal)}</span></div>
                  {discountPercent > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13, color: '#16a34a' }}><span>Discount ({discountPercent}%)</span><span>-{fmt(discountAmount)}</span></div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 16 }}><span>Total</span><span style={{ color: '#fc5a06' }}>{fmt(total)}</span></div>
                </div>
              </>
            )}

            {cart.length > 0 && (
              <button className="adm-btn adm-btn-primary" style={{ width: '100%', marginTop: 14 }} onClick={() => setStep('payment')}>
                Continue to Payment →
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── STEP 3: PAYMENT ─── */}
      {step === 'payment' && (
        <div className="adm-grid-2" style={{ gap: 16 }}>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
            <div style={{ fontWeight: 700, marginBottom: 14 }}>Payment Details</div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Payment Method</label>
              <div className="adm-payment-methods">
                {['cash', 'upi', 'card', 'bank'].map((m) => (
                  <button key={m} style={{
                    padding: '8px', borderRadius: 8, border: `2px solid ${paymentMethod === m ? '#fc5a06' : '#e2e8f0'}`,
                    background: paymentMethod === m ? 'rgba(252,90,6,0.08)' : '#fff',
                    fontWeight: 700, fontSize: 13, cursor: 'pointer', textTransform: 'uppercase',
                  }} onClick={() => setPaymentMethod(m)}>{m}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Amount Paid ₹ (total: {fmt(total)})</label>
              <input type="number" className="adm-input" value={amountPaid} min={0} max={total}
                onChange={(e) => setAmountPaid(e.target.value)} placeholder={String(total)} />
              {balance > 0 && <div style={{ fontSize: 12.5, color: '#d97706', marginTop: 4 }}>Balance: {fmt(balance)}</div>}
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>
                <input type="checkbox" checked={hasOrder} onChange={(e) => setHasOrder(e.target.checked)} />
                This is an order (lens/frame to be made)
              </label>
            </div>
            {hasOrder && (
              <div className="adm-grid-3" style={{ gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Expected Date</label>
                  <input type="date" className="adm-input" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Frame</label>
                  <input className="adm-input" value={frameProduct} onChange={(e) => setFrameProduct(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Lens</label>
                  <input className="adm-input" value={lensProduct} onChange={(e) => setLensProduct(e.target.value)} />
                </div>
              </div>
            )}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Notes</label>
              <textarea className="adm-input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="adm-btn adm-btn-ghost" onClick={() => setStep('products')}>← Back</button>
              <button className="adm-btn adm-btn-primary" style={{ flex: 1 }} disabled={saving} onClick={handleSubmit}>
                <CheckCircle size={14} /> {saving ? 'Creating invoice…' : 'Create Invoice'}
              </button>
            </div>
          </div>
          {/* Order Summary */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
            <div style={{ fontWeight: 700, marginBottom: 14 }}>Order Summary</div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 2 }}>Customer</div>
              <div style={{ fontWeight: 700 }}>{selectedCustomer?.name}</div>
              <div style={{ fontSize: 12.5, color: '#94a3b8' }}>{selectedCustomer?.phone}</div>
            </div>
            {cart.map((i) => (
              <div key={i.product_id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span>{i.product_name} × {i.quantity}</span>
                <span style={{ fontWeight: 600 }}>{fmt(i.unit_price * i.quantity)}</span>
              </div>
            ))}
            <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: 10, marginTop: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 16, marginBottom: 4 }}>
                <span>Total</span><span style={{ color: '#fc5a06' }}>{fmt(total)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#16a34a', fontWeight: 600 }}>
                <span>Paid</span><span>{fmt(paid)}</span>
              </div>
              {balance > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#d97706', fontWeight: 700 }}>
                <span>Balance</span><span>{fmt(balance)}</span>
              </div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function POSPage() {
  return <Suspense><POSContent /></Suspense>;
}

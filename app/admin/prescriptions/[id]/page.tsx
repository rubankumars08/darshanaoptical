'use client';

import { use } from 'react';
import Link from 'next/link';
import { useAdminFetch } from '@/app/lib/admin/useAdminFetch';
import { ArrowLeft, Printer, ShoppingCart } from 'lucide-react';

export default function PrescriptionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, loading } = useAdminFetch<{ eyeTest: any }>(`/api/admin/eye-tests/${id}`);
  const test = data?.eyeTest;

  if (loading) return <div style={{ padding: 32, color: '#94a3b8' }}>Loading prescription…</div>;
  if (!test) return <div style={{ padding: 32, color: '#ef4444' }}>Prescription not found.</div>;

  const eyeRows = ['sph', 'cyl', 'axis', 'add', 'pd'];
  const RE = [test.re_sph, test.re_cyl, test.re_axis, test.re_add, test.re_pd];
  const LE = [test.le_sph, test.le_cyl, test.le_axis, test.le_add, test.le_pd];

  return (
    <div style={{ maxWidth: 680 }}>
      <div className="adm-page-header">
        <Link href="/admin/eye-tests" className="adm-btn adm-btn-ghost adm-btn-sm">
          <ArrowLeft width={14} height={14} /> Eye Tests
        </Link>
        <div style={{ flex: 1 }}>
          <div className="adm-page-title">Prescription</div>
          <div className="adm-page-sub">{test.customer_name} · {new Date(test.test_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => window.print()} className="adm-btn adm-btn-secondary adm-btn-sm">
            <Printer width={13} height={13} /> Print
          </button>
          <Link href={`/admin/pos?customerId=${test.customer_id}`} className="adm-btn adm-btn-primary adm-btn-sm">
            <ShoppingCart width={13} height={13} /> Start Sale
          </Link>
        </div>
      </div>

      <div className="adm-card">
        {/* Header */}
        <div style={{ padding: '24px 28px', borderBottom: '2px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Prescription</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{test.customer_name}</div>
            <div style={{ fontSize: 13.5, color: '#64748b', marginTop: 4 }}>{test.customer_phone}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Darshana Optical</div>
            <div style={{ fontSize: 12.5, color: '#94a3b8' }}>Harur, Tamil Nadu</div>
            <div style={{ fontSize: 12.5, color: '#94a3b8' }}>{new Date(test.test_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
        </div>

        {/* Prescription Table */}
        <div style={{ padding: 28 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #e2e8f0' }}>Eye</th>
                {eyeRows.map((label) => (
                  <th key={label} style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #e2e8f0' }}>{label.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Right (OD)', vals: RE, color: '#2563eb' },
                { label: 'Left (OS)', vals: LE, color: '#dc2626' },
              ].map(({ label, vals, color }) => (
                <tr key={label} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px', fontWeight: 700, color, fontSize: 14 }}>{label}</td>
                  {vals.map((v: any, i: number) => (
                    <td key={i} style={{ padding: '16px', textAlign: 'center', fontFamily: 'monospace', fontSize: 15, fontWeight: 700, color: '#0f172a' }}>
                      {v || '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* VA */}
          {(test.visual_acuity_right || test.visual_acuity_left) && (
            <div style={{ display: 'flex', gap: 20, marginBottom: 16, padding: '14px 16px', background: '#f8fafc', borderRadius: 10 }}>
              <div><span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>VA Right: </span><strong>{test.visual_acuity_right ?? '—'}</strong></div>
              <div><span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>VA Left: </span><strong>{test.visual_acuity_left ?? '—'}</strong></div>
            </div>
          )}

          {/* Recommendation */}
          {test.recommendation && (
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 16px', marginBottom: 12 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recommendation</div>
              <div style={{ fontSize: 14, color: '#1e40af', fontWeight: 500 }}>{test.recommendation}</div>
            </div>
          )}

          {test.notes && (
            <div style={{ background: '#faf8f5', border: '1px solid #e6e6e8', borderRadius: 10, padding: '12px 16px' }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notes</div>
              <div style={{ fontSize: 13.5, color: '#475569' }}>{test.notes}</div>
            </div>
          )}

          <div style={{ marginTop: 28, paddingTop: 16, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#94a3b8' }}>
            <span>Tested by: <strong style={{ color: '#475569' }}>{test.tested_by}</strong></span>
            <span>Darshana Optical — Harur</span>
          </div>
        </div>
      </div>
    </div>
  );
}

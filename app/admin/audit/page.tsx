'use client';

import { useAdminFetch } from '@/app/lib/admin/useAdminFetch';
import { useAuth } from '@/app/lib/admin/auth-context';
import { useState } from 'react';
import TablePagination from '../components/TablePagination';

const ENTITY_COLORS: Record<string, string> = {
  customer: 'adm-badge-info', product: 'adm-badge-warning', invoice: 'adm-badge-success',
  eye_test: 'adm-badge-orange', expense: 'adm-badge-danger', purchase: 'adm-badge-gray',
  supplier: 'adm-badge-info', user: 'adm-badge-danger',
};

export default function AuditPage() {
  const { user } = useAuth();
  const [entity, setEntity] = useState('');
  const params: Record<string, string> = {};
  if (entity) params.entity = entity;
  // The API restricts the trail to management; mirror that here so staff who
  // reach the URL directly get a clear message instead of a failed request.
  const canView = user?.role === 'admin' || user?.role === 'manager';
  const { data, loading } = useAdminFetch<{ logs: any[] }>(canView ? '/api/admin/audit' : null, { params });
  const logs = data?.logs ?? [];

  if (user && !canView) {
    return <div style={{ padding: 32, color: '#94a3b8', textAlign: 'center' }}>Manager or admin access required to view the audit log.</div>;
  }

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <div className="adm-page-title">Audit Log</div>
          <div className="adm-page-sub">{loading ? '…' : `${logs.length} entries`}</div>
        </div>
      </div>
      <div className="adm-tabs" style={{ marginBottom: 16 }}>
        {(['', 'invoice', 'customer', 'product', 'expense', 'purchase', 'user'] as const).map((e) => (
          <button key={e} className={`adm-tab${entity === e ? ' active' : ''}`} onClick={() => setEntity(e)} style={{ fontSize: 12 }}>
            {e === '' ? 'All' : e.charAt(0).toUpperCase() + e.slice(1)}
          </button>
        ))}
      </div>
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr><th>Time</th><th>Action</th><th>Entity</th><th>Details</th><th>By</th><th>Role</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Loading…</td></tr>
            : logs.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>No audit entries.</td></tr>
            : logs.map((l) => (
              <tr key={l.id}>
                <td style={{ fontSize: 11.5, color: '#94a3b8', whiteSpace: 'nowrap' }}>
                  {new Date(l.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td style={{ fontWeight: 700, fontSize: 12, color: l.action === 'DELETE' || l.action === 'CANCEL' ? '#ef4444' : l.action === 'CREATE' ? '#16a34a' : '#0f172a' }}>
                  {l.action}
                </td>
                <td><span className={`adm-badge ${ENTITY_COLORS[l.entity] ?? 'adm-badge-gray'}`}>{l.entity}</span></td>
                <td style={{ fontSize: 12.5, color: '#334155', maxWidth: 300 }}>{l.details}</td>
                <td style={{ fontSize: 12.5, fontWeight: 600 }}>{l.performed_by}</td>
                <td><span className={`adm-badge adm-badge-gray`} style={{ fontSize: 11 }}>{l.performed_by_role}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TablePagination />
    </div>
  );
}

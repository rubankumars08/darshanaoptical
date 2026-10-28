'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAdminFetch } from '@/app/lib/admin/useAdminFetch';
import { Search, Plus, Eye, ShoppingCart, Phone, User } from 'lucide-react';
import TablePagination from '../components/TablePagination';

export default function CustomersPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const params: Record<string, string> = {};
  if (filter !== 'all') params.status = filter;
  if (query) params.q = query;

  const { data, loading, error } = useAdminFetch<{ customers: any[] }>(
    '/api/admin/customers', { params }
  );
  const customers = data?.customers ?? [];

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <div className="adm-page-title">Customers</div>
          <div className="adm-page-sub">{loading ? '…' : `${customers.length} customers`}</div>
        </div>
        <Link href="/admin/customers/new" className="adm-btn adm-btn-primary">
          <Plus width={14} height={14} /> New Customer
        </Link>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="adm-search-wrap" style={{ maxWidth: 340 }}>
          <Search />
          <input
            className="adm-input" placeholder="Search name, phone, ID…"
            value={query} onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="adm-tabs">
          {(['all', 'active', 'inactive'] as const).map((f) => (
            <button key={f} className={`adm-tab${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && <div style={{ color: '#ef4444', padding: 12, marginBottom: 12 }}>Error: {error}</div>}

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Customer ID</th><th>Name</th><th>Phone</th><th>Gender</th>
              <th>Last Visit</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: 32 }}>Loading…</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: 32 }}>
                {query ? 'No customers match your search.' : 'No customers yet.'}
              </td></tr>
            ) : customers.map((c) => (
              <tr key={c.id}>
                <td style={{ fontFamily: 'monospace', fontSize: 12.5, color: '#64748b' }}>{c.customer_id}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{c.name}</div>
                      {c.email && <div style={{ fontSize: 11.5, color: '#94a3b8' }}>{c.email}</div>}
                    </div>
                  </div>
                </td>
                <td style={{ fontWeight: 500 }}>{c.phone}</td>
                <td style={{ color: '#64748b', textTransform: 'capitalize' }}>{c.gender ?? '—'}</td>
                <td style={{ color: '#64748b', fontSize: 13 }}>
                  {c.last_visit ? new Date(c.last_visit).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                </td>
                <td>
                  <span className={`adm-badge ${c.status === 'active' ? 'adm-badge-success' : 'adm-badge-gray'}`}>
                    {c.status}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Link href={`/admin/customers/${c.id}`} className="adm-btn adm-btn-ghost adm-btn-sm" title="View profile"><User width={13} height={13} /></Link>
                    <Link href={`/admin/eye-tests/new?customerId=${c.id}&customerName=${encodeURIComponent(c.name)}`} className="adm-btn adm-btn-ghost adm-btn-sm" title="New eye test"><Eye width={13} height={13} /></Link>
                    <Link href={`/admin/pos?customerId=${c.id}`} className="adm-btn adm-btn-ghost adm-btn-sm" title="New sale"><ShoppingCart width={13} height={13} /></Link>
                    <a href={`tel:${c.phone}`} className="adm-btn adm-btn-ghost adm-btn-sm" title="Call"><Phone width={13} height={13} /></a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TablePagination />
    </div>
  );
}

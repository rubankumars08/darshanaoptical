'use client';

import { useState } from 'react';
import { useAdminFetch } from '@/app/lib/admin/useAdminFetch';
import { BarChart2, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

function fmt(n: number) { return '₹' + Number(n).toLocaleString('en-IN'); }

export default function ReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // Fetch invoices and expenses for selected month
  const [year, month] = selectedMonth.split('-').map(Number);
  const monthEnd = new Date(year, month, 0).getDate(); // last day of selected month
  const rangeFrom = `${selectedMonth}-01`;
  const rangeTo = `${selectedMonth}-${String(monthEnd).padStart(2, '0')}`;

  const { data: invData } = useAdminFetch<{ invoices: any[] }>(
    '/api/admin/invoices', { params: { from: rangeFrom, to: rangeTo } }
  );
  const { data: expData } = useAdminFetch<{ expenses: any[] }>(
    '/api/admin/expenses', { params: { from: rangeFrom, to: rangeTo } }
  );

  const invoices = (invData?.invoices ?? []).filter((i) => i.status !== 'cancelled');
  const expenses = expData?.expenses ?? [];

  const sales = invoices.reduce((s, i) => s + Number(i.total), 0);
  const collected = invoices.reduce((s, i) => s + Number(i.paid), 0);
  const expTotal = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const profit = collected - expTotal;

  // Last 6 months selector
  const months: string[] = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    months.push(d.toISOString().slice(0, 7));
  }

  // Expense breakdown by category
  const byCat: Record<string, number> = {};
  expenses.forEach((e) => { byCat[e.category] = (byCat[e.category] ?? 0) + Number(e.amount); });

  return (
    <div>
      <div className="adm-page-header">
        <div className="adm-page-title">Reports</div>
        <div className="adm-tabs">
          {months.map((m) => (
            <button key={m} className={`adm-tab${selectedMonth === m ? ' active' : ''}`} onClick={() => setSelectedMonth(m)} style={{ fontSize: 12 }}>
              {new Date(m + '-01').toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="adm-grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total Sales', value: fmt(sales), icon: BarChart2, color: '#fc5a06' },
          { label: 'Amount Collected', value: fmt(collected), icon: TrendingUp, color: '#16a34a' },
          { label: 'Total Expenses', value: fmt(expTotal), icon: TrendingDown, color: '#ef4444' },
          { label: 'Net Profit', value: fmt(profit), icon: TrendingUp, color: profit >= 0 ? '#7c3aed' : '#ef4444' },
        ].map((k) => (
          <div key={k.label} className="adm-stat" style={{ borderLeft: `3px solid ${k.color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <div className="adm-stat-label">{k.label}</div>
              <k.icon size={15} style={{ color: k.color }} />
            </div>
            <div className="adm-stat-value" style={{ fontSize: 20, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>
              {new Date(selectedMonth + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </div>
          </div>
        ))}
      </div>

      <div className="adm-grid-2" style={{ gap: 16 }}>
        {/* Invoice Summary */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Invoice Summary</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Total Invoices', value: invoices.length },
              { label: 'Fully Paid', value: invoices.filter((i) => i.status === 'paid').length },
              { label: 'Partially Paid', value: invoices.filter((i) => i.status === 'partially_paid').length },
              { label: 'Pending', value: invoices.filter((i) => i.status === 'pending').length },
            ].map((r) => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, borderBottom: '1px solid #f1f5f9', paddingBottom: 6 }}>
                <span style={{ color: '#64748b' }}>{r.label}</span>
                <span style={{ fontWeight: 700 }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Breakdown */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Expense Breakdown</div>
          {Object.entries(byCat).length === 0 ? (
            <div style={{ color: '#94a3b8', textAlign: 'center', padding: 24 }}>No expenses this month.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ textTransform: 'capitalize', color: '#475569' }}>{cat}</span>
                    <span style={{ fontWeight: 700 }}>{fmt(amount)}</span>
                  </div>
                  <div style={{ height: 4, background: '#f1f5f9', borderRadius: 2 }}>
                    <div style={{ height: '100%', background: '#fc5a06', borderRadius: 2, width: `${Math.round((amount / expTotal) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

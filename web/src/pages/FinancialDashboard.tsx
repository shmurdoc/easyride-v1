import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import EmptyState from '@/components/EmptyState';
import client from '@/api/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart, PieChart, Pie, Cell } from 'recharts';
import dayjs from 'dayjs';

const COLORS = ['#3563ff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

interface FinancialSummary {
  total_revenue: number;
  platform_fees: number;
  driver_payouts: number;
  net_revenue: number;
  pending_payouts: number;
  refunds_total: number;
  avg_fare: number;
  payment_breakdown: { method: string; total: number; count: number }[];
  daily_revenue: { date: string; revenue: number; fees: number; rides: number }[];
  top_categories: { category: string; revenue: number; rides: number }[];
  recent_transactions: { id: string; amount: number; status: string; method: string; created_at: string; rider_name: string }[];
}

const IconRevenue = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const IconFee = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="20" height="12" rx="2" /><path d="M12 12h.01" /><path d="M17 12h.01" /><path d="M7 12h.01" />
  </svg>
);
const IconPayout = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconNet = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

export default function FinancialDashboard() {
  const [data, setData] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(false);
      try {
        const { data: res } = await client.get('/reports/financial', { params: { days } });
        setData(res);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [days]);

  if (error && !data) {
    return (
      <div>
        <PageHeader title="Financial Dashboard" subtitle="Revenue and financial analytics" />
        <EmptyState
          title="Unable to load financial data"
          description="The financial reports endpoint may not be available yet."
          action={
            <button onClick={() => window.location.reload()} className="btn-primary">Retry</button>
          }
        />
      </div>
    );
  }

  const s = data;

  return (
    <div>
      <PageHeader
        title="Financial Dashboard"
        subtitle="Revenue, fees, payouts, and financial analytics"
        actions={
          <select className="input max-w-[180px]" value={days} onChange={(e) => setDays(Number(e.target.value))}>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
        }
      />

      {loading && !s ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card-flat p-5">
              <div className="skeleton h-3 w-20 mb-3" />
              <div className="skeleton h-7 w-24" />
            </div>
          ))}
        </div>
      ) : s ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Revenue" value={`R${(s.total_revenue || 0).toLocaleString()}`} icon={<IconRevenue />} tone="primary" sub="Gross ride revenue" />
            <StatCard label="Platform Fees" value={`R${(s.platform_fees || 0).toLocaleString()}`} icon={<IconFee />} tone="accent" sub={`${s.platform_fees && s.total_revenue ? ((s.platform_fees / s.total_revenue) * 100).toFixed(1) : 0}% of revenue`} />
            <StatCard label="Driver Payouts" value={`R${(s.driver_payouts || 0).toLocaleString()}`} icon={<IconPayout />} tone="warn" sub={`${s.pending_payouts ? `R${s.pending_payouts.toLocaleString()} pending` : ''}`} />
            <StatCard label="Net Revenue" value={`R${(s.net_revenue || 0).toLocaleString()}`} icon={<IconNet />} tone="neutral" sub="Revenue minus fees & refunds" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            <div className="card-flat p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-ink-900">Revenue & Fees</h3>
                  <p className="text-xs text-ink-500 mt-0.5">Daily breakdown</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={s.daily_revenue || []} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3563ff" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#3563ff" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="feeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => dayjs(v).format('D MMM')} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `R${v}`} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 12px 32px -4px rgba(15,23,42,0.12)' }}
                    formatter={(v: number) => [`R${v.toLocaleString()}`, '']}
                    labelFormatter={(v) => dayjs(v).format('ddd, D MMM')}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#3563ff" strokeWidth={2.5} fill="url(#revGrad)" name="Revenue" />
                  <Area type="monotone" dataKey="fees" stroke="#10b981" strokeWidth={2} fill="url(#feeGrad)" name="Platform Fees" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="card-flat p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-ink-900">Payment Methods</h3>
                  <p className="text-xs text-ink-500 mt-0.5">Volume by method</p>
                </div>
              </div>
              {s.payment_breakdown && s.payment_breakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={s.payment_breakdown} dataKey="total" nameKey="method" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
                      {s.payment_breakdown.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => `R${v.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-ink-500 text-center py-12">No payment data</p>
              )}
              {s.payment_breakdown && (
                <div className="mt-3 space-y-1.5">
                  {s.payment_breakdown.map((p, i) => (
                    <div key={p.method} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="capitalize text-ink-600">{p.method}</span>
                      </span>
                      <span className="font-medium text-ink-900">R{p.total.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
            <div className="card-flat p-5">
              <h3 className="text-sm font-semibold text-ink-900 mb-4">Revenue by Category</h3>
              {s.top_categories && s.top_categories.length > 0 ? (
                <div className="space-y-3">
                  {s.top_categories.map((c) => (
                    <div key={c.category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize text-ink-700 font-medium">{c.category}</span>
                        <span className="text-ink-900 font-semibold">R{c.revenue.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-2 bg-ink-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full transition-all"
                          style={{ width: `${s.total_revenue ? (c.revenue / s.total_revenue) * 100 : 0}%` }}
                        />
                      </div>
                      <p className="text-2xs text-ink-500 mt-0.5">{c.rides} rides</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ink-500 text-center py-8">No category data</p>
              )}
            </div>

            <div className="card-flat p-5">
              <h3 className="text-sm font-semibold text-ink-900 mb-4">Recent Transactions</h3>
              {s.recent_transactions && s.recent_transactions.length > 0 ? (
                <div className="space-y-2">
                  {s.recent_transactions.map((t) => (
                    <div key={t.id} className="flex items-center justify-between py-2 border-b border-ink-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-ink-900">{t.rider_name}</p>
                        <p className="text-2xs text-ink-500">{dayjs(t.created_at).format('MMM D, HH:mm')} · {t.method}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-ink-900">R{t.amount}</p>
                        <span className={`text-2xs font-medium capitalize ${
                          t.status === 'completed' ? 'text-emerald-600' :
                          t.status === 'refunded' ? 'text-red-600' :
                          'text-amber-600'
                        }`}>{t.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ink-500 text-center py-8">No recent transactions</p>
              )}
            </div>
          </div>

          <div className="card-flat p-5">
            <h3 className="text-sm font-semibold text-ink-900 mb-2">Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-ink-500">Avg Fare</p>
                <p className="font-semibold text-ink-900">R{(s.avg_fare || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-ink-500">Pending Payouts</p>
                <p className="font-semibold text-ink-900">R{(s.pending_payouts || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-ink-500">Total Refunds</p>
                <p className="font-semibold text-ink-900">R{(s.refunds_total || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-ink-500">Period</p>
                <p className="font-semibold text-ink-900">{days} days</p>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

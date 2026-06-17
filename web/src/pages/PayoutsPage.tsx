import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import PageHeader from '@/components/PageHeader';
import Pagination from '@/components/Pagination';
import client, { PaginatedResponse } from '@/api/client';

interface Payout {
  id: string;
  driver: { name: string };
  amount: number;
  method: string;
  status: string;
  period: string;
  processed_at: string;
}

interface PayoutSummary {
  pending: number;
  paid_week: number;
  paid_month: number;
  average: number;
}

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
  const [summary, setSummary] = useState<PayoutSummary>({ pending: 0, paid_week: 0, paid_month: 0, average: 0 });
  const [loading, setLoading] = useState(true);

  const fetchPayouts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), per_page: '15' };
      const [{ data: payoutsData }, { data: summaryData }] = await Promise.all([
        client.get<PaginatedResponse<Payout>>('/admin/payouts', { params }),
        client.get<PayoutSummary>('/admin/payouts/summary'),
      ]);
      setPayouts(payoutsData.data);
      setMeta(payoutsData.meta);
      setSummary(summaryData || { pending: 0, paid_week: 0, paid_month: 0, average: 0 });
    } catch {} finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchPayouts(); }, [fetchPayouts]);

  const retryPayout = async (id: string) => {
    try { await client.post(`/admin/payouts/${id}/retry`); fetchPayouts(); } catch {}
  };

  const columns = [
    { key: 'driver', label: 'Driver', render: (p: Payout) => p.driver?.name || '—' },
    { key: 'amount', label: 'Amount', render: (p: Payout) => `R${Number(p.amount).toFixed(2)}` },
    { key: 'method', label: 'Method', render: (p: Payout) => p.method || '—' },
    { key: 'status', label: 'Status', render: (p: Payout) => <StatusBadge status={p.status} /> },
    { key: 'period', label: 'Period', render: (p: Payout) => p.period || '—' },
    {
      key: 'processed_at',
      label: 'Processed',
      render: (p: Payout) => p.processed_at ? new Date(p.processed_at).toLocaleDateString() : <span className="text-ink-400">—</span>,
    },
    {
      key: 'actions',
      label: '',
      render: (p: Payout) => (
        p.status === 'failed'
          ? <button onClick={(e) => { e.stopPropagation(); retryPayout(p.id); }} className="text-primary-600 hover:text-primary-700 text-xs font-medium">Retry</button>
          : null
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Driver Payouts" subtitle="Manage and track driver earnings payouts" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card-flat p-5">
          <p className="text-2xs font-semibold uppercase tracking-wider text-ink-500">Pending</p>
          <p className="mt-1.5 text-2xl font-display font-bold text-ink-900">R{summary.pending.toLocaleString()}</p>
        </div>
        <div className="card-flat p-5">
          <p className="text-2xs font-semibold uppercase tracking-wider text-ink-500">This Week</p>
          <p className="mt-1.5 text-2xl font-display font-bold text-accent-700">R{summary.paid_week.toLocaleString()}</p>
        </div>
        <div className="card-flat p-5">
          <p className="text-2xs font-semibold uppercase tracking-wider text-ink-500">This Month</p>
          <p className="mt-1.5 text-2xl font-display font-bold text-ink-900">R{summary.paid_month.toLocaleString()}</p>
        </div>
        <div className="card-flat p-5">
          <p className="text-2xs font-semibold uppercase tracking-wider text-ink-500">Average</p>
          <p className="mt-1.5 text-2xl font-display font-bold text-ink-900">R{summary.average.toLocaleString()}</p>
        </div>
      </div>

      <div className="card-flat overflow-hidden">
        <DataTable columns={columns} data={payouts} loading={loading} emptyMessage="No payouts found" />
      </div>

      <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onPageChange={setPage} />
    </div>
  );
}

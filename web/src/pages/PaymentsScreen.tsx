import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import PageHeader from '@/components/PageHeader';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';
import client, { PaginatedResponse } from '@/api/client';
import dayjs from 'dayjs';

interface Payment {
  id: string;
  amount: number;
  platform_fee: number;
  driver_payout: number;
  method: string;
  gateway: string;
  status: string;
  paid_at: string;
  refunded_at: string;
  refund_amount: number;
  escrow_released: boolean;
  cash_reconciled: boolean;
  created_at: string;
  ride?: { id: string; pickup_address: string; dropoff_address: string };
  payer?: { id: string; name: string; email: string };
}

export default function PaymentsScreen() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Payment | null>(null);

  const loadPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), per_page: '15' };
      if (statusFilter) params.status = statusFilter;
      if (methodFilter) params.method = methodFilter;
      const { data } = await client.get<PaginatedResponse<Payment>>('/payments', { params });
      setPayments(data.data);
      setMeta(data.meta);
    } catch {} finally { setLoading(false); }
  }, [page, statusFilter, methodFilter]);

  useEffect(() => { loadPayments(); }, [loadPayments]);

  const refundPayment = async (id: string) => {
    const reason = prompt('Refund reason (admin_override, driver_no_show, duplicate_charge, technical_issue):');
    if (!reason) return;
    try {
      await client.post(`/payments/${id}/refund`, { reason });
      loadPayments();
      setSelected(null);
    } catch {}
  };

  const columns = [
    {
      key: 'created_at',
      label: 'Date',
      render: (p: Payment) => <span className="text-gray-500">{dayjs(p.created_at).format('MMM D, HH:mm')}</span>,
    },
    { key: 'payer', label: 'Payer', render: (p: Payment) => p.payer?.name || '—' },
    { key: 'method', label: 'Method', render: (p: Payment) => <span className="capitalize">{p.method}</span> },
    { key: 'amount', label: 'Amount', render: (p: Payment) => <span className="font-medium">R{p.amount}</span> },
    { key: 'platform_fee', label: 'Fee', render: (p: Payment) => <span className="text-gray-500">R{p.platform_fee}</span> },
    { key: 'driver_payout', label: 'Driver', render: (p: Payment) => <span className="text-gray-500">R{p.driver_payout || 0}</span> },
    { key: 'status', label: 'Status', render: (p: Payment) => <StatusBadge status={p.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Payments" subtitle="Manage payments, refunds, and reconciliation" />

      <div className="flex gap-4 mb-6">
        <select className="input max-w-[200px]" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <select className="input max-w-[200px]" value={methodFilter} onChange={(e) => { setMethodFilter(e.target.value); setPage(1); }}>
          <option value="">All methods</option>
          <option value="wallet">Wallet</option>
          <option value="cash">Cash</option>
          <option value="payfast">PayFast</option>
          <option value="ozow">Ozow</option>
        </select>
      </div>

      <DataTable columns={columns} data={payments} loading={loading} emptyMessage="No payments found" onRowClick={setSelected} />

      <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onPageChange={setPage} />

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Payment Details" size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Amount</p>
                <p className="text-lg font-bold">R{selected.amount}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <StatusBadge status={selected.status} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Method</p>
                <p className="text-sm capitalize">{selected.method}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Platform Fee</p>
                <p className="text-sm">R{selected.platform_fee}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Driver Payout</p>
                <p className="text-sm">R{selected.driver_payout || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Escrow Released</p>
                <StatusBadge status={selected.escrow_released ? 'active' : 'pending'} />
              </div>
              {selected.refunded_at && (
                <div>
                  <p className="text-xs text-gray-500">Refunded</p>
                  <p className="text-sm">R{selected.refund_amount}</p>
                </div>
              )}
              {selected.method === 'cash' && (
                <div>
                  <p className="text-xs text-gray-500">Cash Reconciled</p>
                  <StatusBadge status={selected.cash_reconciled ? 'active' : 'pending'} />
                </div>
              )}
            </div>
            {selected.ride && (
              <div className="border-t pt-4">
                <p className="text-xs text-gray-500">Ride</p>
                <p className="text-sm">{selected.ride.pickup_address} → {selected.ride.dropoff_address}</p>
              </div>
            )}
            {selected.status === 'completed' && !selected.refunded_at && (
              <div className="pt-4 border-t">
                <button onClick={() => refundPayment(selected.id)} className="btn-danger">Process Refund</button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

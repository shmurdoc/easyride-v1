import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import PageHeader from '@/components/PageHeader';
import Pagination from '@/components/Pagination';
import client, { PaginatedResponse } from '@/api/client';

interface FoodOrder {
  id: string;
  restaurant: { name: string };
  customer: { name: string };
  driver: { name: string } | null;
  total_amount: number;
  status: string;
  created_at: string;
}

export default function FoodOrdersPage() {
  const [orders, setOrders] = useState<FoodOrder[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), per_page: '15' };
      if (filter !== 'all') params.status = filter;
      const { data } = await client.get<PaginatedResponse<FoodOrder>>('/admin/food/orders', { params });
      setOrders(data.data);
      setMeta(data.meta);
    } catch {} finally { setLoading(false); }
  }, [page, filter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const isDelayed = (createdAt: string, status: string) => {
    if (['delivered', 'cancelled'].includes(status)) return '';
    const minutes = (Date.now() - new Date(createdAt).getTime()) / 60000;
    if (minutes > 90) return 'bg-danger-50/30';
    if (minutes > 60) return 'bg-warn-50/30';
    return '';
  };

  const columns = [
    {
      key: 'id',
      label: 'Order ID',
      render: (o: FoodOrder) => <span className="font-mono text-xs">{o.id.substring(0, 8)}...</span>,
    },
    {
      key: 'restaurant',
      label: 'Restaurant',
      render: (o: FoodOrder) => o.restaurant?.name || '—',
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (o: FoodOrder) => o.customer?.name || '—',
    },
    {
      key: 'driver',
      label: 'Driver',
      render: (o: FoodOrder) => o.driver?.name || <span className="text-ink-400">Unassigned</span>,
    },
    {
      key: 'total_amount',
      label: 'Amount',
      render: (o: FoodOrder) => `R${Number(o.total_amount).toFixed(2)}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (o: FoodOrder) => <StatusBadge status={o.status} />,
    },
    {
      key: 'created_at',
      label: 'Time',
      render: (o: FoodOrder) => new Date(o.created_at).toLocaleTimeString(),
    },
  ];

  return (
    <div>
      <PageHeader title="Food Orders" subtitle="Track and manage food delivery orders" />

      <div className="flex gap-4 mb-6">
        <select className="input max-w-[200px]" value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="card-flat overflow-hidden">
        <DataTable columns={columns} data={orders} loading={loading} emptyMessage="No food orders found" />
      </div>

      <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onPageChange={setPage} />
    </div>
  );
}

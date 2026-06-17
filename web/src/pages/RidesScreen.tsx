import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import PageHeader from '@/components/PageHeader';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';
import client, { PaginatedResponse } from '@/api/client';
import dayjs from 'dayjs';

interface Ride {
  id: string;
  status: string;
  category: string;
  pickup_address: string;
  dropoff_address: string;
  distance_km: number;
  total_fare: number;
  payment_method: string;
  payment_status: string;
  created_at: string;
  rider?: { id: string; name: string; email: string };
  driver?: { id: string; name: string; email: string };
}

export default function RidesScreen() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Ride | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const loadRides = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), per_page: '15' };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const { data } = await client.get<PaginatedResponse<Ride>>('/admin/rides', { params });
      setRides(data.data);
      setMeta(data.meta);
    } catch {} finally { setLoading(false); }
  }, [page, statusFilter, search]);

  useEffect(() => { loadRides(); }, [loadRides]);

  const cancelRide = async (id: string) => {
    if (!cancelReason.trim()) return;
    try {
      await client.post(`/admin/rides/${id}/cancel`, { cancellation_reason: cancelReason });
      setCancelReason('');
      setSelected(null);
      loadRides();
    } catch {}
  };

  const columns = [
    {
      key: 'created_at',
      label: 'Date',
      render: (r: Ride) => <span className="text-gray-500">{dayjs(r.created_at).format('MMM D, HH:mm')}</span>,
    },
    {
      key: 'rider',
      label: 'Rider',
      render: (r: Ride) => <span>{r.rider?.name || '—'}</span>,
    },
    {
      key: 'driver',
      label: 'Driver',
      render: (r: Ride) => <span>{r.driver?.name || '—'}</span>,
    },
    {
      key: 'route',
      label: 'Route',
      render: (r: Ride) => (
        <div className="max-w-xs">
          <p className="text-xs text-gray-500 truncate">{r.pickup_address}</p>
          <p className="text-xs text-gray-400">→ {r.dropoff_address}</p>
        </div>
      ),
    },
    { key: 'distance_km', label: 'Distance', render: (r: Ride) => `${r.distance_km} km` },
    { key: 'category', label: 'Type', render: (r: Ride) => <StatusBadge status={r.category} /> },
    { key: 'total_fare', label: 'Fare', render: (r: Ride) => <span className="font-medium">R{r.total_fare}</span> },
    { key: 'status', label: 'Status', render: (r: Ride) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Rides" subtitle="Manage all ride requests and activity" />

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search rides..."
          className="input max-w-xs"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select
          className="input max-w-[200px]"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">All statuses</option>
          <option value="searching">Searching</option>
          <option value="accepted">Accepted</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={rides}
        loading={loading}
        emptyMessage="No rides found"
        onRowClick={(r) => setSelected(r)}
      />

      <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onPageChange={setPage} />

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Ride Details" size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Rider</p>
                <p className="text-sm font-medium">{selected.rider?.name}</p>
                <p className="text-xs text-gray-400">{selected.rider?.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Driver</p>
                <p className="text-sm font-medium">{selected.driver?.name || 'Unassigned'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Pickup</p>
                <p className="text-sm">{selected.pickup_address}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Dropoff</p>
                <p className="text-sm">{selected.dropoff_address}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Distance</p>
                <p className="text-sm">{selected.distance_km} km</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Fare</p>
                <p className="text-sm font-medium">R{selected.total_fare}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Payment</p>
                <p className="text-sm">{selected.payment_method} — <StatusBadge status={selected.payment_status} /></p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <StatusBadge status={selected.status} />
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500">Created</p>
              <p className="text-sm">{dayjs(selected.created_at).format('DD MMM YYYY, HH:mm')}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

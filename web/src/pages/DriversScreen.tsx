import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import PageHeader from '@/components/PageHeader';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';
import client, { PaginatedResponse } from '@/api/client';

interface Driver {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  is_online: boolean;
  status: string;
  created_at: string;
  driver_profile?: {
    license_number: string;
    vehicle_make: string;
    vehicle_model: string;
    vehicle_year: number;
    vehicle_color: string;
    license_plate: string;
    approval_status: string;
  };
}

export default function DriversScreen() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Driver | null>(null);

  const loadDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), per_page: '15' };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const { data } = await client.get<PaginatedResponse<Driver>>('/admin/drivers', { params });
      setDrivers(data.data);
      setMeta(data.meta);
    } catch {} finally { setLoading(false); }
  }, [page, statusFilter, search]);

  useEffect(() => { loadDrivers(); }, [loadDrivers]);

  const approveDriver = async (id: string) => {
    try { await client.post(`/admin/drivers/${id}/approve`); loadDrivers(); } catch {}
  };

  const rejectDriver = async (id: string) => {
    try { await client.post(`/admin/drivers/${id}/reject`); loadDrivers(); } catch {}
  };

  const columns = [
    {
      key: 'name',
      label: 'Driver',
      render: (d: Driver) => (
        <div>
          <p className="font-medium">{d.name}</p>
          <p className="text-xs text-gray-400">{d.email}</p>
        </div>
      ),
    },
    { key: 'phone_number', label: 'Phone', render: (d: Driver) => d.phone_number || '—' },
    {
      key: 'vehicle',
      label: 'Vehicle',
      render: (d: Driver) => {
        const p = d.driver_profile;
        return p ? <span>{p.vehicle_year} {p.vehicle_make} {p.vehicle_model}</span> : <span className="text-gray-400">—</span>;
      },
    },
    { key: 'is_online', label: 'Status', render: (d: Driver) => <StatusBadge status={d.is_online ? 'online' : 'offline'} /> },
    {
      key: 'approval',
      label: 'Approval',
      render: (d: Driver) => <StatusBadge status={d.driver_profile?.approval_status || 'pending'} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (d: Driver) => (
        <div className="flex gap-2">
          {d.driver_profile?.approval_status === 'pending' && (
            <>
              <button onClick={(e) => { e.stopPropagation(); approveDriver(d.id); }} className="text-emerald-600 hover:text-emerald-700 text-xs font-medium">
                Approve
              </button>
              <button onClick={(e) => { e.stopPropagation(); rejectDriver(d.id); }} className="text-red-600 hover:text-red-700 text-xs font-medium">
                Reject
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Drivers" subtitle="Manage driver accounts and approvals" />

      <div className="flex gap-4 mb-6">
        <input type="text" placeholder="Search drivers..." className="input max-w-xs" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <select className="input max-w-[200px]" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="pending">Pending Approval</option>
          <option value="approved">Approved</option>
        </select>
      </div>

      <DataTable columns={columns} data={drivers} loading={loading} emptyMessage="No drivers found" onRowClick={setSelected} />

      <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onPageChange={setPage} />

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Driver Details" size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="text-sm font-medium">{selected.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm">{selected.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="text-sm">{selected.phone_number}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Online Status</p>
                <StatusBadge status={selected.is_online ? 'online' : 'offline'} />
              </div>
            </div>
            {selected.driver_profile && (
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-3">Vehicle</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Vehicle</p>
                    <p className="text-sm">{selected.driver_profile.vehicle_year} {selected.driver_profile.vehicle_make} {selected.driver_profile.vehicle_model}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Color / Plate</p>
                    <p className="text-sm">{selected.driver_profile.vehicle_color} • {selected.driver_profile.license_plate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">License</p>
                    <p className="text-sm">{selected.driver_profile.license_number}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Approval</p>
                    <StatusBadge status={selected.driver_profile.approval_status} />
                  </div>
                </div>
              </div>
            )}
            {selected.driver_profile?.approval_status === 'pending' && (
              <div className="flex gap-3 pt-4 border-t">
                <button onClick={() => { approveDriver(selected.id); setSelected(null); }} className="btn-success">
                  Approve Driver
                </button>
                <button onClick={() => { rejectDriver(selected.id); setSelected(null); }} className="btn-danger">
                  Reject Driver
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

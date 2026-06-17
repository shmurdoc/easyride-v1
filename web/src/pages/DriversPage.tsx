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
  phone: string;
  status: 'pending_review' | 'approved' | 'rejected' | 'expired';
  documents: string[];
  registeredAt: string;
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

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Driver | null>(null);
  const [batchIds, setBatchIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), per_page: '15' };
      if (filter !== 'all') params.status = filter;
      if (search) params.search = search;
      const { data } = await client.get<PaginatedResponse<Driver>>('/admin/drivers', { params });
      setDrivers(data.data);
      setMeta(data.meta);
    } catch {} finally { setLoading(false); }
  }, [page, filter, search]);

  useEffect(() => { fetchDrivers(); }, [fetchDrivers]);

  const handleApprove = async (id: string) => {
    try { await client.post(`/admin/drivers/${id}/approve`); fetchDrivers(); } catch {}
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    try {
      await client.post(`/admin/drivers/${id}/reject`, { reason });
      fetchDrivers();
    } catch {}
  };

  const handleBatchApprove = async () => {
    for (const id of batchIds) await handleApprove(id);
    setBatchIds([]);
  };

  const toggleBatch = (id: string) => {
    setBatchIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const columns = [
    {
      key: 'select',
      label: '',
      render: (d: Driver) => (
        <input type="checkbox" checked={batchIds.includes(d.id)} onChange={() => toggleBatch(d.id)} className="w-4 h-4 rounded border-ink-300 text-primary-600" />
      ),
    },
    {
      key: 'name',
      label: 'Driver',
      render: (d: Driver) => (
        <div>
          <p className="font-medium text-ink-900">{d.name}</p>
          <p className="text-xs text-ink-500">{d.email}</p>
        </div>
      ),
    },
    { key: 'phone', label: 'Phone', render: (d: Driver) => d.phone || '—' },
    {
      key: 'status',
      label: 'Status',
      render: (d: Driver) => <StatusBadge status={d.driver_profile?.approval_status || d.status} />,
    },
    { key: 'documents', label: 'Documents', render: (d: Driver) => `${d.documents?.length || 0} files` },
    { key: 'registeredAt', label: 'Registered', render: (d: Driver) => new Date(d.registeredAt).toLocaleDateString() },
    {
      key: 'actions',
      label: '',
      render: (d: Driver) => (
        <div className="flex gap-2">
          <button onClick={(e) => { e.stopPropagation(); handleApprove(d.id); }} disabled={d.status === 'approved'} className="text-accent-600 hover:text-accent-700 text-xs font-medium disabled:opacity-50">
            Approve
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleReject(d.id); }} disabled={d.status === 'rejected'} className="text-danger-600 hover:text-danger-700 text-xs font-medium disabled:opacity-50">
            Reject
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Drivers"
        subtitle="Review driver documents and manage approvals"
        actions={
          batchIds.length > 0 && (
            <button onClick={handleBatchApprove} className="btn-primary btn-sm">
              Approve Selected ({batchIds.length})
            </button>
          )
        }
      />

      <div className="flex gap-4 mb-6">
        <input type="text" placeholder="Search name, email, phone..." className="input max-w-xs" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <select className="input max-w-[200px]" value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}>
          <option value="all">All</option>
          <option value="pending_review">Pending Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <DataTable columns={columns} data={drivers} loading={loading} emptyMessage="No drivers found" onRowClick={setSelected} />

      <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onPageChange={setPage} />

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.name || 'Driver'} size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xs font-semibold uppercase tracking-wider text-ink-500">Name</p>
                <p className="text-sm font-medium mt-1">{selected.name}</p>
              </div>
              <div>
                <p className="text-2xs font-semibold uppercase tracking-wider text-ink-500">Email</p>
                <p className="text-sm mt-1">{selected.email}</p>
              </div>
              <div>
                <p className="text-2xs font-semibold uppercase tracking-wider text-ink-500">Phone</p>
                <p className="text-sm mt-1">{selected.phone}</p>
              </div>
              <div>
                <p className="text-2xs font-semibold uppercase tracking-wider text-ink-500">Status</p>
                <div className="mt-1"><StatusBadge status={selected.driver_profile?.approval_status || selected.status} /></div>
              </div>
            </div>
            {selected.documents?.length > 0 && (
              <div className="border-t border-ink-100 pt-4">
                <p className="text-sm font-semibold text-ink-900 mb-2">Documents</p>
                <div className="space-y-1">
                  {selected.documents.map((doc, i) => (
                    <div key={i} className="text-sm text-ink-600">{doc}</div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-3 pt-4 border-t border-ink-100">
              <button onClick={() => { handleApprove(selected.id); setSelected(null); }} className="btn-primary btn-sm">Approve</button>
              <button onClick={() => { handleReject(selected.id); setSelected(null); }} className="btn-danger btn-sm">Reject</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

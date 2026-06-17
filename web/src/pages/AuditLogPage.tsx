import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '@/components/DataTable';
import PageHeader from '@/components/PageHeader';
import Pagination from '@/components/Pagination';
import client, { PaginatedResponse } from '@/api/client';
import dayjs from 'dayjs';

interface AuditEntry {
  id: string;
  user_name: string;
  action: string;
  resource_type: string;
  resource_id: string;
  description: string;
  old_values?: any;
  new_values?: any;
  ip_address: string;
  created_at: string;
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filters, setFilters] = useState({ action: '', resource_type: '' });
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), per_page: '20' };
      if (filters.action) params.action = filters.action;
      if (filters.resource_type) params.resource_type = filters.resource_type;
      const { data } = await client.get<PaginatedResponse<AuditEntry>>('/admin/audit-logs', { params });
      setLogs(data.data);
      setMeta(data.meta);
    } catch {} finally { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const actionColor = (action: string) => {
    const colors: Record<string, string> = { create: '#10B981', update: '#3563ff', delete: '#EF4444', approve: '#F59E0B', reject: '#EF4444' };
    return { color: colors[action] || '#6B7280' };
  };

  const exportCsv = () => {
    const header = 'Timestamp,Admin,Action,Resource,ID,Summary\n';
    const rows = logs.map(l => `"${l.created_at}","${l.user_name}","${l.action}","${l.resource_type}","${l.resource_id}","${l.description}"`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'audit-log.csv'; a.click();
  };

  const columns = [
    {
      key: 'created_at',
      label: 'Timestamp',
      render: (l: AuditEntry) => <span className="text-ink-500 text-xs">{dayjs(l.created_at).format('MMM D, HH:mm')}</span>,
    },
    { key: 'user_name', label: 'Admin', render: (l: AuditEntry) => l.user_name || '—' },
    {
      key: 'action',
      label: 'Action',
      render: (l: AuditEntry) => (
        <span className="font-mono text-xs font-semibold uppercase" style={actionColor(l.action)}>
          {l.action}
        </span>
      ),
    },
    { key: 'resource_type', label: 'Resource', render: (l: AuditEntry) => (
      <span className="text-xs">{l.resource_type}<span className="text-ink-400">:{l.resource_id.substring(0, 8)}</span></span>
    )},
    { key: 'description', label: 'Summary', render: (l: AuditEntry) => (
      <span className="text-sm text-ink-700">{l.description}</span>
    )},
  ];

  return (
    <div>
      <PageHeader
        title="Audit Log"
        subtitle="Track all administrative actions"
        actions={
          <button onClick={exportCsv} className="btn-secondary btn-sm">Export CSV</button>
        }
      />

      <div className="flex gap-4 mb-6">
        <select className="input max-w-[180px]" value={filters.action} onChange={(e) => setFilters(f => ({ ...f, action: e.target.value }))}>
          <option value="">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="approve">Approve</option>
          <option value="reject">Reject</option>
        </select>
        <select className="input max-w-[180px]" value={filters.resource_type} onChange={(e) => setFilters(f => ({ ...f, resource_type: e.target.value }))}>
          <option value="">All Resources</option>
          <option value="ride">Ride</option>
          <option value="payment">Payment</option>
          <option value="user">User</option>
          <option value="driver">Driver</option>
          <option value="setting">Setting</option>
        </select>
      </div>

      <div className="card-flat overflow-hidden">
        <DataTable
          columns={columns}
          data={logs}
          loading={loading}
          emptyMessage="No audit logs found"
          onRowClick={(l) => setExpanded(expanded === l.id ? null : l.id)}
        />
      </div>

      {expanded && (
        <div className="card-flat p-5 mt-4 animate-slide-down">
          {(() => {
            const log = logs.find(l => l.id === expanded);
            if (!log) return null;
            return (
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-2xs font-semibold uppercase tracking-wider text-ink-500">Old Values</span>
                  <pre className="mt-1 text-xs bg-ink-50 rounded-lg p-3 overflow-x-auto">{JSON.stringify(log.old_values, null, 2)}</pre>
                </div>
                <div>
                  <span className="text-2xs font-semibold uppercase tracking-wider text-ink-500">New Values</span>
                  <pre className="mt-1 text-xs bg-ink-50 rounded-lg p-3 overflow-x-auto">{JSON.stringify(log.new_values, null, 2)}</pre>
                </div>
                <div>
                  <span className="text-2xs font-semibold uppercase tracking-wider text-ink-500">IP Address</span>
                  <p className="mt-1 font-mono text-xs">{log.ip_address}</p>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onPageChange={setPage} />
    </div>
  );
}

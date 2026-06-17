import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '@/components/DataTable';
import PageHeader from '@/components/PageHeader';
import Pagination from '@/components/Pagination';
import client, { PaginatedResponse } from '@/api/client';
import dayjs from 'dayjs';

interface AuditLog {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  description: string;
  user_id: string;
  user_name: string;
  ip_address: string;
  created_at: string;
}

export default function AuditLogScreen() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), per_page: '20' };
      if (actionFilter) params.action = actionFilter;
      if (resourceFilter) params.resource_type = resourceFilter;
      if (userIdFilter) params.user_id = userIdFilter;
      const { data } = await client.get<PaginatedResponse<AuditLog>>('/admin/audit-logs', { params });
      setLogs(data.data);
      setMeta(data.meta);
    } catch {} finally { setLoading(false); }
  }, [page, actionFilter, resourceFilter, userIdFilter]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const columns = [
    {
      key: 'created_at',
      label: 'Date',
      render: (l: AuditLog) => <span className="text-gray-500">{dayjs(l.created_at).format('MMM D, HH:mm')}</span>,
    },
    { key: 'action', label: 'Action', render: (l: AuditLog) => <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{l.action}</span> },
    { key: 'resource_type', label: 'Resource', render: (l: AuditLog) => <span className="capitalize">{l.resource_type}</span> },
    { key: 'resource_id', label: 'Resource ID', render: (l: AuditLog) => <span className="text-xs text-gray-500">{l.resource_id}</span> },
    { key: 'description', label: 'Description', render: (l: AuditLog) => <span className="text-sm">{l.description}</span> },
    { key: 'user_name', label: 'User', render: (l: AuditLog) => l.user_name || l.user_id || '—' },
  ];

  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="Track all administrative actions" />

      <div className="flex gap-4 mb-6 flex-wrap">
        <input
          type="text"
          placeholder="Filter by action..."
          className="input max-w-[180px]"
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
        />
        <input
          type="text"
          placeholder="Resource type..."
          className="input max-w-[180px]"
          value={resourceFilter}
          onChange={(e) => { setResourceFilter(e.target.value); setPage(1); }}
        />
        <input
          type="text"
          placeholder="User ID..."
          className="input max-w-[180px]"
          value={userIdFilter}
          onChange={(e) => { setUserIdFilter(e.target.value); setPage(1); }}
        />
      </div>

      <DataTable columns={columns} data={logs} loading={loading} emptyMessage="No audit logs found" />

      <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onPageChange={setPage} />
    </div>
  );
}

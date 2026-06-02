import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '@/components/DataTable';
import PageHeader from '@/components/PageHeader';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';
import client, { PaginatedResponse } from '@/api/client';
import dayjs from 'dayjs';

interface User {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  role: string;
  created_at: string;
}

export default function UsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<User | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), per_page: '15' };
      if (search) params.search = search;
      const { data } = await client.get<PaginatedResponse<User>>('/admin/users', { params });
      setUsers(data.data);
      setMeta(data.meta);
    } catch {} finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const deleteUser = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    try { await client.delete(`/admin/users/${id}`); loadUsers(); setSelected(null); } catch {}
  };

  const columns = [
    {
      key: 'name',
      label: 'User',
      render: (u: User) => (
        <div>
          <p className="font-medium">{u.name}</p>
          <p className="text-xs text-gray-400">{u.email}</p>
        </div>
      ),
    },
    { key: 'phone_number', label: 'Phone', render: (u: User) => u.phone_number || '—' },
    { key: 'role', label: 'Role', render: (u: User) => <span className="capitalize">{u.role}</span> },
    { key: 'created_at', label: 'Joined', render: (u: User) => dayjs(u.created_at).format('MMM D, YYYY') },
  ];

  return (
    <div>
      <PageHeader title="Users" subtitle="Manage all registered users" />

      <div className="flex gap-4 mb-6">
        <input type="text" placeholder="Search users..." className="input max-w-xs" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>

      <DataTable columns={columns} data={users} loading={loading} emptyMessage="No users found" onRowClick={setSelected} />

      <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onPageChange={setPage} />

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="User Details">
        {selected && (
          <div className="space-y-4">
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
              <p className="text-xs text-gray-500">Role</p>
              <p className="text-sm capitalize">{selected.role}</p>
            </div>
            <div className="pt-4 border-t">
              <button onClick={() => deleteUser(selected.id)} className="btn-danger">Delete User</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

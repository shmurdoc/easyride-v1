import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '@/components/DataTable';
import PageHeader from '@/components/PageHeader';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';
import EmptyState from '@/components/EmptyState';
import client, { PaginatedResponse } from '@/api/client';
import dayjs from 'dayjs';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  audience: string;
  sent_count: number;
  failed_count: number;
  created_at: string;
  sent_at: string | null;
  status: string;
}

type Tab = 'send' | 'history';

export default function NotificationManager() {
  const [tab, setTab] = useState<Tab>('history');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Notification | null>(null);
  const [sending, setSending] = useState(false);

  const [form, setForm] = useState({
    title: '',
    body: '',
    type: 'general',
    audience: 'all',
    user_id: '',
  });

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await client.get<PaginatedResponse<Notification>>('/admin/notifications', { params: { page: String(page), per_page: '20' } });
      setNotifications(data.data);
      setMeta(data.meta);
    } catch {} finally { setLoading(false); }
  }, [page]);

  useEffect(() => {
    if (tab === 'history') loadHistory();
  }, [tab, loadHistory]);

  const resetForm = () => {
    setForm({ title: '', body: '', type: 'general', audience: 'all', user_id: '' });
  };

  const sendNotification = async () => {
    if (!form.title.trim() || !form.body.trim()) return;
    setSending(true);
    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        body: form.body,
        type: form.type,
        audience: form.audience,
      };
      if (form.audience === 'user' && form.user_id.trim()) {
        payload.user_id = form.user_id.trim();
      }
      await client.post('/admin/notifications/send', payload);
      resetForm();
      setTab('history');
      loadHistory();
    } catch {} finally { setSending(false); }
  };

  const columns = [
    {
      key: 'title',
      label: 'Notification',
      render: (n: Notification) => (
        <div>
          <p className="font-medium text-ink-900">{n.title}</p>
          <p className="text-xs text-ink-500 truncate max-w-xs">{n.body}</p>
        </div>
      ),
    },
    { key: 'type', label: 'Type', render: (n: Notification) => <span className="capitalize text-sm">{n.type}</span> },
    { key: 'audience', label: 'Audience', render: (n: Notification) => <span className="capitalize text-sm">{n.audience}</span> },
    { key: 'sent_count', label: 'Sent', render: (n: Notification) => <span className="text-sm">{n.sent_count || 0}</span> },
    { key: 'failed_count', label: 'Failed', render: (n: Notification) => <span className={`text-sm ${n.failed_count > 0 ? 'text-red-600' : 'text-ink-500'}`}>{n.failed_count || 0}</span> },
    {
      key: 'status',
      label: 'Status',
      render: (n: Notification) => (
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          n.status === 'sent' ? 'bg-emerald-50 text-emerald-700' :
          n.status === 'sending' ? 'bg-blue-50 text-blue-700' :
          n.status === 'failed' ? 'bg-red-50 text-red-700' :
          'bg-ink-100 text-ink-600'
        }`}>
          {n.status}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (n: Notification) => <span className="text-xs text-ink-500">{dayjs(n.created_at).format('MMM D, HH:mm')}</span>,
    },
  ];

  const tabs: { key: Tab; label: string }[] = [
    { key: 'history', label: 'Notification History' },
    { key: 'send', label: 'Compose Notification' },
  ];

  return (
    <div>
      <PageHeader title="Notifications" subtitle="Send push notifications and view delivery history" />

      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
              tab === t.key ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'history' && (
        <>
          <DataTable
            columns={columns}
            data={notifications}
            loading={loading}
            emptyMessage="No notifications sent yet"
            onRowClick={(n) => setSelected(n)}
          />
          <Pagination currentPage={meta.current_page} lastPage={meta.last_page} onPageChange={setPage} />

          <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.title || 'Notification'} size="lg">
            {selected && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-ink-500">Type</p>
                    <p className="text-sm capitalize">{selected.type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-500">Audience</p>
                    <p className="text-sm capitalize">{selected.audience}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-500">Sent</p>
                    <p className="text-sm">{selected.sent_count || 0} delivered</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-500">Failed</p>
                    <p className="text-sm text-red-600">{selected.failed_count || 0} failed</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-500">Created</p>
                    <p className="text-sm">{dayjs(selected.created_at).format('DD MMM YYYY, HH:mm')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-ink-500">Sent At</p>
                    <p className="text-sm">{selected.sent_at ? dayjs(selected.sent_at).format('DD MMM YYYY, HH:mm') : '—'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-ink-500">Message</p>
                  <p className="text-sm mt-1 text-ink-700 whitespace-pre-wrap">{selected.body}</p>
                </div>
              </div>
            )}
          </Modal>
        </>
      )}

      {tab === 'send' && (
        <div className="max-w-2xl card-flat p-6">
          <h3 className="text-base font-semibold text-ink-900 mb-1">Compose Push Notification</h3>
          <p className="text-xs text-ink-500 mb-6">Send a push notification to riders, drivers, or a specific user.</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Title</label>
              <input
                className="input"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Ride discount available"
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Message</label>
              <textarea
                className="input min-h-[120px] resize-y"
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder="Write your notification message..."
                maxLength={500}
              />
              <p className="text-2xs text-ink-500 mt-1">{form.body.length}/500 characters</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Type</label>
                <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="general">General</option>
                  <option value="promo">Promotional</option>
                  <option value="alert">Alert</option>
                  <option value="ride_update">Ride Update</option>
                  <option value="account">Account</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Audience</label>
                <select className="input" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
                  <option value="all">All Users</option>
                  <option value="riders">Riders</option>
                  <option value="drivers">Drivers</option>
                  <option value="user">Specific User</option>
                </select>
              </div>
            </div>

            {form.audience === 'user' && (
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">User ID</label>
                <input
                  className="input"
                  value={form.user_id}
                  onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                  placeholder="Enter user ID"
                />
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-ink-100">
              <button
                onClick={sendNotification}
                disabled={sending || !form.title.trim() || !form.body.trim()}
                className="btn-primary"
              >
                {sending ? 'Sending...' : 'Send Notification'}
              </button>
              <button onClick={resetForm} className="btn-secondary">Clear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

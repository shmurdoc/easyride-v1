import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import PageHeader from '@/components/PageHeader';
import Modal from '@/components/Modal';
import client from '@/api/client';
import dayjs from 'dayjs';

interface PromoCode {
  id: string;
  code: string;
  type: string;
  value: number;
  max_uses: number;
  used_count: number;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

export default function PromoScreen() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PromoCode | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PromoCode | null>(null);

  const [form, setForm] = useState({
    code: '', type: 'percentage', value: 0, max_uses: 100, expires_at: '', is_active: true,
  });

  const loadPromos = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await client.get('/promo-codes');
      setPromos(Array.isArray(data) ? data : data.data || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { loadPromos(); }, [loadPromos]);

  const resetForm = () => {
    setForm({ code: '', type: 'percentage', value: 0, max_uses: 100, expires_at: '', is_active: true });
    setEditing(null);
  };

  const savePromo = async () => {
    try {
      if (editing) {
        await client.put(`/promo-codes/${editing.id}`, form);
      } else {
        await client.post('/promo-codes', form);
      }
      setShowForm(false);
      resetForm();
      loadPromos();
    } catch {}
  };

  const deletePromo = async (id: string) => {
    if (!confirm('Delete this promo code?')) return;
    try {
      await client.delete(`/promo-codes/${id}`);
      if (selected?.id === id) setSelected(null);
      loadPromos();
    } catch {}
  };

  const openEdit = (p: PromoCode) => {
    setEditing(p);
    setForm({ code: p.code, type: p.type, value: p.value, max_uses: p.max_uses, expires_at: p.expires_at ? dayjs(p.expires_at).format('YYYY-MM-DD') : '', is_active: p.is_active });
    setShowForm(true);
  };

  const columns = [
    { key: 'code', label: 'Code', render: (p: PromoCode) => <span className="font-mono font-medium uppercase">{p.code}</span> },
    { key: 'type', label: 'Type', render: (p: PromoCode) => <span className="capitalize">{p.type}</span> },
    { key: 'value', label: 'Value', render: (p: PromoCode) => p.type === 'percentage' ? `${p.value}%` : `R${p.value}` },
    { key: 'max_uses', label: 'Uses', render: (p: PromoCode) => `${p.used_count || 0} / ${p.max_uses || '∞'}` },
    { key: 'expires_at', label: 'Expires', render: (p: PromoCode) => p.expires_at ? dayjs(p.expires_at).format('MMM D, YYYY') : '—' },
    { key: 'is_active', label: 'Active', render: (p: PromoCode) => <StatusBadge status={p.is_active ? 'active' : 'inactive'} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Promo Codes"
        subtitle="Manage promotional discount codes"
        actions={
          <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary">Create Promo Code</button>
        }
      />

      <DataTable columns={columns} data={promos} loading={loading} emptyMessage="No promo codes found" onRowClick={(p) => setSelected(p)} />

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Promo Code Details">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Code</p>
                <p className="text-sm font-mono font-medium uppercase">{selected.code}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Type / Value</p>
                <p className="text-sm capitalize">{selected.type} — {selected.type === 'percentage' ? `${selected.value}%` : `R${selected.value}`}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Usage</p>
                <p className="text-sm">{selected.used_count || 0} / {selected.max_uses || '∞'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Active</p>
                <StatusBadge status={selected.is_active ? 'active' : 'inactive'} />
              </div>
              {selected.expires_at && (
                <div>
                  <p className="text-xs text-gray-500">Expires</p>
                  <p className="text-sm">{dayjs(selected.expires_at).format('DD MMM YYYY')}</p>
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-4 border-t">
              <button onClick={() => { openEdit(selected); setSelected(null); }} className="btn-primary">Edit</button>
              <button onClick={() => deletePromo(selected.id)} className="btn-danger">Delete</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); resetForm(); }} title={editing ? 'Edit Promo Code' : 'Create Promo Code'} size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
            <input className="input uppercase" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} disabled={!!editing} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
              <input type="number" className="input" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses</label>
              <input type="number" className="input" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: Number(e.target.value) })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expires At</label>
              <input type="date" className="input" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" className="w-4 h-4 rounded text-primary-600" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            <label className="text-sm font-medium text-gray-700">Active</label>
          </div>
          <div className="flex gap-3 pt-4 border-t">
            <button onClick={savePromo} className="btn-primary">{editing ? 'Save Changes' : 'Create'}</button>
            <button onClick={() => { setShowForm(false); resetForm(); }} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

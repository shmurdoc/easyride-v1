import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import PageHeader from '@/components/PageHeader';
import Modal from '@/components/Modal';
import client from '@/api/client';

interface Restaurant {
  id: string;
  name: string;
  cuisine_type: string;
  is_active: boolean;
  rating: number;
  delivery_fee: number;
  min_order: number;
  slug: string;
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Restaurant | null>(null);
  const [form, setForm] = useState({ name: '', cuisine_type: 'south_african' });

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await client.get('/admin/food/restaurants');
      setRestaurants(Array.isArray(data) ? data : data.data || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchRestaurants(); }, [fetchRestaurants]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await client.put(`/admin/food/restaurants/${editing.id}`, form);
      } else {
        await client.post('/admin/food/restaurants', form);
      }
      setShowModal(false);
      setEditing(null);
      setForm({ name: '', cuisine_type: 'south_african' });
      fetchRestaurants();
    } catch {}
  };

  const openEdit = (r: Restaurant) => {
    setEditing(r);
    setForm({ name: r.name, cuisine_type: r.cuisine_type });
    setShowModal(true);
  };

  const columns = [
    { key: 'name', label: 'Name', render: (r: Restaurant) => <span className="font-medium text-ink-900">{r.name}</span> },
    { key: 'cuisine_type', label: 'Cuisine', render: (r: Restaurant) => <span className="capitalize">{r.cuisine_type || '—'}</span> },
    { key: 'is_active', label: 'Status', render: (r: Restaurant) => <StatusBadge status={r.is_active ? 'active' : 'inactive'} /> },
    { key: 'rating', label: 'Rating', render: (r: Restaurant) => <span>{r.rating?.toFixed(1) || '—'}</span> },
    {
      key: 'actions',
      label: '',
      render: (r: Restaurant) => (
        <div className="flex gap-2">
          <button onClick={(e) => { e.stopPropagation(); openEdit(r); }} className="text-primary-600 hover:text-primary-700 text-xs font-medium">Edit</button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Restaurants"
        subtitle="Manage food delivery restaurant partners"
        actions={
          <button onClick={() => { setEditing(null); setForm({ name: '', cuisine_type: 'south_african' }); setShowModal(true); }} className="btn-primary">
            Add Restaurant
          </button>
        }
      />

      <DataTable columns={columns} data={restaurants} loading={loading} emptyMessage="No restaurants found" />

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditing(null); }} title={editing ? 'Edit Restaurant' : 'Add Restaurant'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Cuisine Type</label>
            <select className="input" value={form.cuisine_type} onChange={e => setForm({ ...form, cuisine_type: e.target.value })}>
              <option value="south_african">South African</option>
              <option value="italian">Italian</option>
              <option value="chinese">Chinese</option>
              <option value="indian">Indian</option>
              <option value="fast_food">Fast Food</option>
              <option value="grill">Grill & Braai</option>
              <option value="seafood">Seafood</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4 border-t border-ink-100">
            <button type="submit" className="btn-primary btn-sm">{editing ? 'Update' : 'Create'}</button>
            <button type="button" onClick={() => { setShowModal(false); setEditing(null); }} className="btn-secondary btn-sm">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import PageHeader from '@/components/PageHeader';
import Modal from '@/components/Modal';
import client from '@/api/client';
import dayjs from 'dayjs';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  is_available: boolean;
  category: { id: string; name: string };
}

interface Category {
  id: string;
  name: string;
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  cuisine_type: string;
  delivery_fee: number;
  min_order: number;
  is_active: boolean;
  opening_hours: string;
  created_at: string;
  menu_items?: MenuItem[];
  categories?: Category[];
}

export default function FoodScreen() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Restaurant | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Restaurant | null>(null);

  const [form, setForm] = useState({
    name: '', slug: '', cuisine_type: '', delivery_fee: 0,
    min_order: 0, opening_hours: '', is_active: true,
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [catName, setCatName] = useState('');
  const [menuForm, setMenuForm] = useState({ name: '', price: 0, description: '', category_id: '', is_available: true });
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const loadRestaurants = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      const { data } = await client.get('/admin/food/restaurants', { params });
      setRestaurants(Array.isArray(data) ? data : data.data || []);
    } catch {} finally { setLoading(false); }
  }, [search]);

  useEffect(() => { loadRestaurants(); }, [loadRestaurants]);

  const resetForm = () => {
    setForm({ name: '', slug: '', cuisine_type: '', delivery_fee: 0, min_order: 0, opening_hours: '', is_active: true });
    setEditing(null);
  };

  const saveRestaurant = async () => {
    try {
      if (editing) {
        await client.put(`/admin/food/restaurants/${editing.id}`, form);
      } else {
        await client.post('/admin/food/restaurants', form);
      }
      setShowForm(false);
      resetForm();
      loadRestaurants();
    } catch {}
  };

  const openEdit = (r: Restaurant) => {
    setEditing(r);
    setForm({ name: r.name, slug: r.slug, cuisine_type: r.cuisine_type, delivery_fee: r.delivery_fee, min_order: r.min_order, opening_hours: r.opening_hours || '', is_active: r.is_active });
    setShowForm(true);
  };

  const loadMenuAndCategories = async (restaurantId: string) => {
    try {
      const { data } = await client.get(`/admin/food/restaurants`, {});
      const found = (Array.isArray(data) ? data : data.data || []).find((r: Restaurant) => r.id === restaurantId);
      if (found) {
        setMenuItems(found.menu_items || []);
        setCategories(found.categories || []);
      }
    } catch {}
  };

  const openDetail = (r: Restaurant) => {
    setSelected(r);
    loadMenuAndCategories(r.id);
  };

  const saveCategory = async () => {
    if (!selected || !catName.trim()) return;
    try {
      await client.post(`/admin/food/restaurants/${selected.id}/categories`, { name: catName });
      setCatName('');
      setShowCategoryForm(false);
      loadMenuAndCategories(selected.id);
    } catch {}
  };

  const saveMenuItem = async () => {
    try {
      if (editingItem) {
        await client.put(`/admin/food/menu-items/${editingItem.id}`, menuForm);
      } else if (selected) {
        await client.post(`/admin/food/restaurants/${selected.id}/menu-items`, menuForm);
      }
      setShowMenuForm(false);
      setEditingItem(null);
      setMenuForm({ name: '', price: 0, description: '', category_id: '', is_available: true });
      if (selected) loadMenuAndCategories(selected.id);
    } catch {}
  };

  const deleteMenuItem = async (id: string) => {
    if (!confirm('Delete this menu item?')) return;
    try {
      await client.delete(`/admin/food/menu-items/${id}`);
      if (selected) loadMenuAndCategories(selected.id);
    } catch {}
  };

  const columns = [
    {
      key: 'name',
      label: 'Restaurant',
      render: (r: Restaurant) => (
        <div>
          <p className="font-medium">{r.name}</p>
          <p className="text-xs text-gray-400">{r.slug}</p>
        </div>
      ),
    },
    { key: 'cuisine_type', label: 'Cuisine', render: (r: Restaurant) => <span className="capitalize">{r.cuisine_type || '—'}</span> },
    { key: 'delivery_fee', label: 'Delivery', render: (r: Restaurant) => `R${r.delivery_fee}` },
    { key: 'min_order', label: 'Min Order', render: (r: Restaurant) => `R${r.min_order}` },
    { key: 'is_active', label: 'Active', render: (r: Restaurant) => <StatusBadge status={r.is_active ? 'active' : 'inactive'} /> },
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

  const menuColumns = [
    { key: 'name', label: 'Item' },
    { key: 'price', label: 'Price', render: (i: MenuItem) => `R${i.price}` },
    { key: 'category', label: 'Category', render: (i: MenuItem) => i.category?.name || '—' },
    { key: 'is_available', label: 'Available', render: (i: MenuItem) => <StatusBadge status={i.is_available ? 'active' : 'inactive'} /> },
    {
      key: 'actions',
      label: '',
      render: (i: MenuItem) => (
        <div className="flex gap-2">
          <button onClick={() => { setEditingItem(i); setMenuForm({ name: i.name, price: i.price, description: i.description || '', category_id: i.category?.id || '', is_available: i.is_available }); setShowMenuForm(true); }} className="text-primary-600 hover:text-primary-700 text-xs font-medium">Edit</button>
          <button onClick={() => deleteMenuItem(i.id)} className="text-red-600 hover:text-red-700 text-xs font-medium">Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Food Management"
        subtitle="Manage restaurants, menus, and categories"
        actions={
          <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary">Add Restaurant</button>
        }
      />

      <div className="flex gap-4 mb-6">
        <input type="text" placeholder="Search restaurants..." className="input max-w-xs" value={search} onChange={(e) => { setSearch(e.target.value); }} />
      </div>

      <DataTable columns={columns} data={restaurants} loading={loading} emptyMessage="No restaurants found" onRowClick={openDetail} />

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); resetForm(); }} title={editing ? 'Edit Restaurant' : 'Add Restaurant'} size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: editing ? form.slug : e.target.value.toLowerCase().replace(/\s+/g, '-') })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input className="input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine Type</label>
            <input className="input" value={form.cuisine_type} onChange={(e) => setForm({ ...form, cuisine_type: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Fee (R)</label>
              <input type="number" className="input" value={form.delivery_fee} onChange={(e) => setForm({ ...form, delivery_fee: Number(e.target.value) })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Order (R)</label>
              <input type="number" className="input" value={form.min_order} onChange={(e) => setForm({ ...form, min_order: Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Opening Hours</label>
            <input className="input" value={form.opening_hours} onChange={(e) => setForm({ ...form, opening_hours: e.target.value })} placeholder="e.g. 08:00-22:00" />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" className="w-4 h-4 rounded text-primary-600" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            <label className="text-sm font-medium text-gray-700">Active</label>
          </div>
          <div className="flex gap-3 pt-4 border-t">
            <button onClick={saveRestaurant} className="btn-primary">{editing ? 'Save Changes' : 'Create Restaurant'}</button>
            <button onClick={() => { setShowForm(false); resetForm(); }} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.name || 'Restaurant'} size="lg">
        {selected && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Cuisine</p>
                <p className="text-sm capitalize">{selected.cuisine_type || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Delivery Fee / Min Order</p>
                <p className="text-sm">R{selected.delivery_fee} / R{selected.min_order}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Hours</p>
                <p className="text-sm">{selected.opening_hours || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Active</p>
                <StatusBadge status={selected.is_active ? 'active' : 'inactive'} />
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold">Categories</h4>
                <button onClick={() => setShowCategoryForm(true)} className="text-xs text-primary-600 hover:text-primary-700 font-medium">+ Add Category</button>
              </div>
              {categories.length === 0 ? (
                <p className="text-sm text-gray-400">No categories yet</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <span key={c.id} className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{c.name}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold">Menu Items</h4>
                <button onClick={() => { setEditingItem(null); setMenuForm({ name: '', price: 0, description: '', category_id: categories[0]?.id || '', is_available: true }); setShowMenuForm(true); }} className="text-xs text-primary-600 hover:text-primary-700 font-medium">+ Add Item</button>
              </div>
              <DataTable columns={menuColumns} data={menuItems} loading={false} emptyMessage="No menu items" />
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showCategoryForm} onClose={() => setShowCategoryForm(false)} title="Add Category">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
            <input className="input" value={catName} onChange={(e) => setCatName(e.target.value)} />
          </div>
          <div className="flex gap-3 pt-4 border-t">
            <button onClick={saveCategory} className="btn-primary">Save</button>
            <button onClick={() => setShowCategoryForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showMenuForm} onClose={() => { setShowMenuForm(false); setEditingItem(null); }} title={editingItem ? 'Edit Menu Item' : 'Add Menu Item'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input className="input" value={menuForm.name} onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (R)</label>
            <input type="number" className="input" value={menuForm.price} onChange={(e) => setMenuForm({ ...menuForm, price: Number(e.target.value) })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className="input" value={menuForm.description} onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })} rows={2} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select className="input" value={menuForm.category_id} onChange={(e) => setMenuForm({ ...menuForm, category_id: e.target.value })}>
              <option value="">No category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" className="w-4 h-4 rounded text-primary-600" checked={menuForm.is_available} onChange={(e) => setMenuForm({ ...menuForm, is_available: e.target.checked })} />
            <label className="text-sm font-medium text-gray-700">Available</label>
          </div>
          <div className="flex gap-3 pt-4 border-t">
            <button onClick={saveMenuItem} className="btn-primary">{editingItem ? 'Save Changes' : 'Add Item'}</button>
            <button onClick={() => { setShowMenuForm(false); setEditingItem(null); }} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

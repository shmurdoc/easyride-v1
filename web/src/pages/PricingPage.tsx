import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import client from '@/api/client';

interface FareCategory {
  name: string;
  baseFare: number;
  perKmRate: number;
  perMinuteRate: number;
  minFare: number;
  cancellationFee: number;
}

const defaultCategories: FareCategory[] = [
  { name: 'Standard', baseFare: 15, perKmRate: 10, perMinuteRate: 2, minFare: 25, cancellationFee: 10 },
  { name: 'Premium', baseFare: 25, perKmRate: 15, perMinuteRate: 3, minFare: 40, cancellationFee: 15 },
  { name: 'Luxury', baseFare: 40, perKmRate: 22, perMinuteRate: 5, minFare: 60, cancellationFee: 25 },
  { name: 'Delivery', baseFare: 20, perKmRate: 8, perMinuteRate: 1.5, minFare: 30, cancellationFee: 0 },
  { name: 'Food', baseFare: 10, perKmRate: 6, perMinuteRate: 1, minFare: 20, cancellationFee: 0 },
];

export default function PricingPage() {
  const [categories, setCategories] = useState<FareCategory[]>(defaultCategories);
  const [activeTab, setActiveTab] = useState(0);
  const [surgeEnabled, setSurgeEnabled] = useState(false);
  const [surgeMultiplier, setSurgeMultiplier] = useState(1.5);
  const [platformFee, setPlatformFee] = useState(15);
  const [draft, setDraft] = useState<FareCategory | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await client.get('/admin/settings');
        const settings = data.settings || data;
        if (settings.surge_enabled !== undefined) setSurgeEnabled(settings.surge_enabled);
        if (settings.surge_multiplier) setSurgeMultiplier(Number(settings.surge_multiplier));
        if (settings.platform_fee_percent) setPlatformFee(Number(settings.platform_fee_percent));
      } catch {}
    }
    load();
  }, []);

  const startEditing = (cat: FareCategory) => setDraft({ ...cat });

  const saveCategory = () => {
    if (!draft) return;
    setCategories(prev => prev.map(c => c.name === draft.name ? draft : c));
    setDraft(null);
  };

  const publishChanges = async () => {
    setSaving(true);
    try {
      await client.post('/admin/settings', {
        pricing: categories,
        surge_enabled: surgeEnabled,
        surge_multiplier: surgeMultiplier,
        platform_fee_percent: platformFee,
      });
    } catch {} finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader
        title="Pricing Editor"
        subtitle="Configure fare rates, surge pricing, and platform fees"
        actions={
          <button onClick={publishChanges} disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Publish Changes'}
          </button>
        }
      />

      <div className="card-flat p-6">
        <div className="flex gap-2 mb-6 flex-wrap">
          {categories.map((cat, i) => (
            <button
              key={cat.name}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                i === activeTab ? 'bg-primary-600 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
              }`}
              onClick={() => setActiveTab(i)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="max-w-xl">
          {draft ? (
            <div className="space-y-4">
              {Object.entries(draft).filter(([k]) => k !== 'name').map(([key, val]) => (
                <div key={key}>
                  <label className="label">{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</label>
                  <input
                    type="number" step="0.01" className="input"
                    value={val as number}
                    onChange={e => setDraft({ ...draft!, [key]: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-4">
                <button onClick={saveCategory} className="btn-primary btn-sm">Save</button>
                <button onClick={() => setDraft(null)} className="btn-secondary btn-sm">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(categories[activeTab]).filter(([k]) => k !== 'name').map(([key, val]) => (
                <div key={key}>
                  <label className="label">{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</label>
                  <div className="text-sm font-medium text-ink-900">R{typeof val === 'number' ? val.toFixed(2) : val}</div>
                </div>
              ))}
              <button onClick={() => startEditing(categories[activeTab])} className="btn-secondary btn-sm mt-4">Edit</button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <div className="card-flat p-5">
          <h3 className="text-sm font-semibold text-ink-900 mb-4">Surge Pricing</h3>
          <label className="flex items-center gap-3 mb-4">
            <input type="checkbox" checked={surgeEnabled} onChange={e => setSurgeEnabled(e.target.checked)} className="w-4 h-4 rounded text-primary-600" />
            <span className="text-sm text-ink-700">Enable Surge Pricing</span>
          </label>
          {surgeEnabled && (
            <div>
              <label className="label">Multiplier: {surgeMultiplier.toFixed(1)}x</label>
              <input type="range" min="1" max="3" step="0.1" value={surgeMultiplier} onChange={e => setSurgeMultiplier(parseFloat(e.target.value))} className="w-full" />
            </div>
          )}
        </div>

        <div className="card-flat p-5">
          <h3 className="text-sm font-semibold text-ink-900 mb-4">Platform Fee</h3>
          <label className="label">Fee Percentage: {platformFee}%</label>
          <input type="range" min="5" max="30" value={platformFee} onChange={e => setPlatformFee(parseInt(e.target.value))} className="w-full" />
        </div>
      </div>
    </div>
  );
}

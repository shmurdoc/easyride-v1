import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import client from '@/api/client';

interface FareConfig {
  base_fare: number;
  per_km_fare: number;
  minimum_fare: number;
  surge_multiplier: number;
  platform_fee_percent: number;
  cancellation_fee: number;
}

const categories = ['standard', 'premium', 'luxury'];

export default function PricingScreen() {
  const [selectedCategory, setSelectedCategory] = useState('standard');
  const [fares, setFares] = useState<Record<string, FareConfig>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await client.get('/admin/settings');
        const settings = data.settings || data;
        const parsed: Record<string, FareConfig> = {};
        for (const cat of categories) {
          parsed[cat] = {
            base_fare: settings[`${cat}_base_fare`] || 25,
            per_km_fare: settings[`${cat}_per_km_fare`] || 8,
            minimum_fare: settings[`${cat}_minimum_fare`] || 25,
            surge_multiplier: settings[`${cat}_surge_multiplier`] || 1.0,
            platform_fee_percent: settings.platform_fee_percent || 15,
            cancellation_fee: settings.cancellation_fee || 25,
          };
        }
        setFares(parsed);
      } catch {} finally { setLoading(false); }
    }
    load();
  }, []);

  const saveFares = async () => {
    setSaving(true);
    try {
      const settings: Record<string, unknown> = {};
      for (const cat of categories) {
        settings[`${cat}_base_fare`] = fares[cat].base_fare;
        settings[`${cat}_per_km_fare`] = fares[cat].per_km_fare;
        settings[`${cat}_minimum_fare`] = fares[cat].minimum_fare;
        settings[`${cat}_surge_multiplier`] = fares[cat].surge_multiplier;
      }
      settings.platform_fee_percent = fares.standard.platform_fee_percent;
      settings.cancellation_fee = fares.standard.cancellation_fee;
      await client.post('/admin/settings', { settings });
    } catch {} finally { setSaving(false); }
  };

  if (loading) {
    return <div className="card animate-pulse h-64" />;
  }

  const current = fares[selectedCategory] || fares.standard;

  return (
    <div>
      <PageHeader
        title="Pricing"
        subtitle="Configure fare settings for each ride category"
        actions={
          <button onClick={saveFares} disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        }
      />

      <div className="flex gap-4 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-6 py-3 rounded-lg font-medium capitalize ${
              selectedCategory === cat
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="card max-w-2xl">
        <h3 className="text-lg font-semibold mb-4 capitalize">{selectedCategory} Fares</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base Fare (R)</label>
            <input
              type="number"
              className="input"
              value={current.base_fare}
              onChange={(e) => setFares({
                ...fares,
                [selectedCategory]: { ...current, base_fare: Number(e.target.value) },
              })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Per Km Rate (R)</label>
            <input
              type="number"
              className="input"
              value={current.per_km_fare}
              onChange={(e) => setFares({
                ...fares,
                [selectedCategory]: { ...current, per_km_fare: Number(e.target.value) },
              })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Fare (R)</label>
            <input
              type="number"
              className="input"
              value={current.minimum_fare}
              onChange={(e) => setFares({
                ...fares,
                [selectedCategory]: { ...current, minimum_fare: Number(e.target.value) },
              })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Surge Multiplier</label>
            <input
              type="number"
              step="0.1"
              className="input"
              value={current.surge_multiplier}
              onChange={(e) => setFares({
                ...fares,
                [selectedCategory]: { ...current, surge_multiplier: Number(e.target.value) },
              })}
            />
          </div>
        </div>

        <div className="border-t mt-6 pt-6">
          <h3 className="text-lg font-semibold mb-4">Platform Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platform Fee (%)</label>
              <input
                type="number"
                className="input"
                value={current.platform_fee_percent}
                onChange={(e) => setFares({
                  ...fares,
                  [selectedCategory]: { ...current, platform_fee_percent: Number(e.target.value) },
                })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cancellation Fee (R)</label>
              <input
                type="number"
                className="input"
                value={current.cancellation_fee}
                onChange={(e) => setFares({
                  ...fares,
                  [selectedCategory]: { ...current, cancellation_fee: Number(e.target.value) },
                })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

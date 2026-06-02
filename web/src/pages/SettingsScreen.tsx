import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import client from '@/api/client';

interface SystemSettings {
  platform_name: string;
  support_email: string;
  support_phone: string;
  max_ride_radius_km: number;
  ride_expiry_minutes: number;
  driver_auto_offline_minutes: number;
  min_driver_distance_km: number;
  app_version: string;
  maintenance_mode: boolean;
}

export default function SettingsScreen() {
  const [settings, setSettings] = useState<SystemSettings>({
    platform_name: 'EasyRyde',
    support_email: 'support@easyryde.co.za',
    support_phone: '',
    max_ride_radius_km: 25,
    ride_expiry_minutes: 5,
    driver_auto_offline_minutes: 10,
    min_driver_distance_km: 0.5,
    app_version: '1.0.0',
    maintenance_mode: false,
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await client.get('/admin/settings');
        setSettings((prev) => ({ ...prev, ...(data.settings || data) }));
      } catch {} finally { setLoading(false); }
    }
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await client.post('/admin/settings', { settings });
    } catch {} finally { setSaving(false); }
  };

  if (loading) {
    return <div className="card animate-pulse h-64" />;
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Platform configuration"
        actions={
          <button onClick={save} disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-6 max-w-4xl">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">General</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platform Name</label>
              <input className="input" value={settings.platform_name} onChange={(e) => setSettings({ ...settings, platform_name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
              <input className="input" value={settings.support_email} onChange={(e) => setSettings({ ...settings, support_email: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Support Phone</label>
              <input className="input" value={settings.support_phone} onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })} />
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Ride Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Ride Radius (km)</label>
              <input type="number" className="input" value={settings.max_ride_radius_km} onChange={(e) => setSettings({ ...settings, max_ride_radius_km: Number(e.target.value) })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ride Expiry (minutes)</label>
              <input type="number" className="input" value={settings.ride_expiry_minutes} onChange={(e) => setSettings({ ...settings, ride_expiry_minutes: Number(e.target.value) })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Driver Auto Offline (minutes)</label>
              <input type="number" className="input" value={settings.driver_auto_offline_minutes} onChange={(e) => setSettings({ ...settings, driver_auto_offline_minutes: Number(e.target.value) })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Driver Distance (km)</label>
              <input type="number" step="0.1" className="input" value={settings.min_driver_distance_km} onChange={(e) => setSettings({ ...settings, min_driver_distance_km: Number(e.target.value) })} />
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Maintenance</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                className="w-4 h-4 rounded text-primary-600"
                checked={settings.maintenance_mode}
                onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
              />
              <label className="text-sm font-medium text-gray-700">Enable Maintenance Mode</label>
            </div>
            <p className="text-xs text-gray-400">When enabled, the app will show a maintenance message to users.</p>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">System Info</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">App Version</span>
              <span className="text-sm font-medium">{settings.app_version}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Platform</span>
              <span className="text-sm font-medium">Phalaborwa</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Currency</span>
              <span className="text-sm font-medium">ZAR (R)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

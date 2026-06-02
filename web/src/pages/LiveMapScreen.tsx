import React, { useState, useEffect, useRef } from 'react';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import client from '@/api/client';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const PHALABORWA_CENTER = { lat: -23.9468, lng: 29.4726 };

interface OnlineDriver {
  id: string;
  user_id: string;
  name: string;
  lat: number;
  lng: number;
  last_seen: string;
  vehicle?: string;
}

function DriverMarker({ driver }: { driver: OnlineDriver }) {
  const icon = L.divIcon({
    className: 'custom-marker',
    html: `<div style="background:#10B981;width:32px;height:32px;border-radius:50%;border:3px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:12px;">🚗</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  return (
    <Marker position={[driver.lat, driver.lng]} icon={icon}>
      <Popup>
        <div>
          <p className="font-medium">{driver.name}</p>
          {driver.vehicle && <p className="text-xs text-gray-500">{driver.vehicle}</p>}
          <p className="text-xs text-gray-400">Last seen: {new Date(driver.last_seen).toLocaleTimeString()}</p>
        </div>
      </Popup>
    </Marker>
  );
}

function MapUpdater({ drivers }: { drivers: OnlineDriver[] }) {
  const map = useMap();
  useEffect(() => {
    if (drivers.length > 0) {
      const bounds = L.latLngBounds(drivers.map((d) => [d.lat, d.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [drivers, map]);
  return null;
}

export default function LiveMapScreen() {
  const [drivers, setDrivers] = useState<OnlineDriver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await client.get('/admin/drivers', { params: { is_online: 'true', per_page: '100' } });
        const onlineDrivers = (data.data || []).flatMap((d: any): OnlineDriver[] => {
          const lat = d.current_latitude;
          const lng = d.current_longitude;
          if (typeof lat !== 'number' || typeof lng !== 'number') {
            return [];
          }
          return [{
            id: d.id,
            user_id: d.id,
            name: d.name,
            lat,
            lng,
            last_seen: d.last_location_update || new Date().toISOString(),
            vehicle: d.driver_profile?.vehicle_make && d.driver_profile?.vehicle_model
              ? `${d.driver_profile.vehicle_year ?? ''} ${d.driver_profile.vehicle_make} ${d.driver_profile.vehicle_model}`.trim()
              : '',
          }];
        });
        setDrivers(onlineDrivers);
      } catch (err) {
        console.warn('[LiveMap] failed to load online drivers:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <PageHeader title="Live Map" subtitle={`${drivers.length} drivers online in Phalaborwa`} />

      <div className="card p-0 overflow-hidden" style={{ height: 'calc(100vh - 280px)' }}>
        <MapContainer
          center={[PHALABORWA_CENTER.lat, PHALABORWA_CENTER.lng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {drivers.map((driver) => (
            <DriverMarker key={driver.id} driver={driver} />
          ))}
          <MapUpdater drivers={drivers} />
        </MapContainer>
      </div>

      {drivers.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Online Drivers</h3>
          <div className="grid grid-cols-4 gap-3">
            {drivers.map((d) => (
              <div key={d.id} className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-easy rounded-full" />
                  <p className="text-sm font-medium">{d.name}</p>
                </div>
                {d.vehicle && <p className="text-xs text-gray-400 mt-1">{d.vehicle}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import client from '@/api/client';

interface Metrics {
  activeRides: number;
  onlineDrivers: number;
  revenueToday: number;
  pendingApprovals: number;
  avgWaitTime: number;
  cancellationRate: number;
  rideTrend: number[];
  driverTrend: number[];
  revenueTrend: number[];
  waitTimeTrend: number[];
  cancellationTrend: number[];
}

const defaultMetrics: Metrics = {
  activeRides: 0, onlineDrivers: 0, revenueToday: 0, pendingApprovals: 0,
  avgWaitTime: 0, cancellationRate: 0,
  rideTrend: [], driverTrend: [], revenueTrend: [],
  waitTimeTrend: [], cancellationTrend: [],
};

export function useRealtimeMetrics() {
  const [metrics, setMetrics] = useState<Metrics>(defaultMetrics);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const es = new EventSource('/api/v1/admin/metrics/stream');
    es.onopen = () => setIsConnected(true);
    es.onerror = () => setIsConnected(false);
    es.addEventListener('metrics', (e) => {
      try { setMetrics(JSON.parse(e.data)); } catch {}
    });
    return () => es.close();
  }, []);

  const refetch = useCallback(async () => {
    try {
      const { data } = await client.get('/admin/dashboard');
      setMetrics(prev => ({ ...prev, ...data }));
    } catch {}
  }, []);

  return { metrics, isConnected, refetch };
}

import { useState, useCallback } from 'react';
import { apiClient } from '../../../packages/api-client/src';

interface ScheduledRideData {
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  category: string;
  scheduledAt: string;
  recurring?: 'daily' | 'weekly' | 'monthly';
  recurringEnd?: string;
  recurringDays?: number[];
}

export function useScheduledRide() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scheduleRide = useCallback(async (data: ScheduledRideData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/api/v1/scheduled-rides', data);
      return response.data;
    } catch (e: any) {
      setError(e.message || 'Failed to schedule ride');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelScheduledRide = useCallback(async (id: string) => {
    try {
      await apiClient.post(`/api/v1/scheduled-rides/${id}/cancel`);
      return true;
    } catch (e: any) {
      setError(e.message);
      return false;
    }
  }, []);

  return { scheduleRide, cancelScheduledRide, loading, error };
}

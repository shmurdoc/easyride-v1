import { useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { offlineQueue } from '../../../packages/api-client/src/offlineQueue';

interface RideRequestData {
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  category: string;
}

export function useOfflineRideRequest() {
  const requestRide = useCallback(async (data: RideRequestData) => {
    const state = await NetInfo.fetch();
    if (state.isConnected) {
      return 'online';
    }
    await offlineQueue.enqueue({
      method: 'POST',
      url: '/api/v1/rides',
      data,
    });
    return 'queued';
  }, []);

  return { requestRide };
}

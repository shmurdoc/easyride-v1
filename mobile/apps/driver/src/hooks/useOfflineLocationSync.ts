import { useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { offlineQueue } from '../../../packages/api-client/src/offlineQueue';

interface LocationPoint {
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export function useOfflineLocationSync() {
  const queueLocation = useCallback(async (location: LocationPoint) => {
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      await offlineQueue.enqueue({
        method: 'POST',
        url: '/api/v1/drivers/location/batch',
        data: { locations: [location] },
      });
    }
  }, []);

  return { queueLocation };
}

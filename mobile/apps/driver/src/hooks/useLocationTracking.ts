import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3001';

interface LocationTrackingOptions {
  onLocationUpdate?: (location: Location.LocationObject) => void;
  rideActive?: boolean;
  authToken?: string;
}

export function useLocationTracking({ onLocationUpdate, rideActive = false, authToken }: LocationTrackingOptions = {}) {
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const locationQueueRef = useRef<Location.LocationObject[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const connectSocket = useCallback(() => {
    if (!authToken) return;
    const socket = io(SOCKET_URL, {
      auth: { token: authToken },
      transports: ['websocket'],
    });
    socketRef.current = socket;
    return socket;
  }, [authToken]);

  const flushLocations = useCallback(() => {
    if (locationQueueRef.current.length === 0) return;
    if (!socketRef.current?.connected) return;

    socketRef.current.emit('driver:location-update', {
      locations: locationQueueRef.current.map(loc => ({
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
        heading: loc.coords.heading,
        speed: loc.coords.speed,
        accuracy: loc.coords.accuracy,
        timestamp: loc.timestamp,
      })),
    });
    locationQueueRef.current = [];
  }, []);

  const startTracking = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        return;
      }

      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        setError('Background location permission denied');
        return;
      }

      connectSocket();

      const updateInterval = rideActive ? 5000 : 10000;

      subscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: rideActive ? Location.Accuracy.High : Location.Accuracy.Balanced,
          timeInterval: updateInterval,
          distanceInterval: rideActive ? 10 : 50,
        },
        (location) => {
          setCurrentLocation(location);
          locationQueueRef.current.push(location);
          onLocationUpdate?.(location);
        }
      );

      intervalRef.current = setInterval(() => {
        flushLocations();
      }, 5000);

      setIsTracking(true);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  }, [rideActive, onLocationUpdate, connectSocket, flushLocations]);

  const stopTracking = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    flushLocations();
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsTracking(false);
  }, [flushLocations]);

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return { isTracking, error, currentLocation, startTracking, stopTracking };
}

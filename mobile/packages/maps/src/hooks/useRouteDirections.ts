import { useState, useEffect, useCallback } from 'react';
import polyline from '@mapbox/polyline';

export interface RoutePoint {
  latitude: number;
  longitude: number;
}

export interface RouteData {
  points: RoutePoint[];
  distance: number;
  duration: number;
  polylineString: string;
}

export function useRouteDirections(originLat: number, originLng: number, destLat: number, destLng: number) {
  const [route, setRoute] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=polyline`;
      const response = await fetch(url);
      const json = await response.json();
      if (json.code !== 'Ok') throw new Error('Route not found');

      const decoded = polyline.decode(json.routes[0].geometry);
      const points: RoutePoint[] = decoded.map(([lat, lng]: [number, number]) => ({ latitude: lat, longitude: lng }));

      setRoute({
        points,
        distance: json.routes[0].distance,
        duration: json.routes[0].duration,
        polylineString: json.routes[0].geometry,
      });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [originLat, originLng, destLat, destLng]);

  useEffect(() => {
    if (originLat && originLng && destLat && destLng) fetchRoute();
  }, [fetchRoute, originLat, originLng, destLat, destLng]);

  return { route, loading, error, refetch: fetchRoute };
}

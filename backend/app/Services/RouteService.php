<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RouteService
{
    private const float EARTH_RADIUS_KM = 6371.0;

    public function getRoute(float $pickupLat, float $pickupLng, float $dropoffLat, float $dropoffLng): array
    {
        $cacheKey = sprintf('route:%.4f:%.4f:%.4f:%.4f', $pickupLat, $pickupLng, $dropoffLat, $dropoffLng);

        return Cache::remember($cacheKey, 300, function () use ($pickupLat, $pickupLng, $dropoffLat, $dropoffLng) {
            try {
                $response = Http::withHeaders(['User-Agent' => 'EasyRyde/1.0'])
                    ->timeout(5)
                    ->get("https://router.project-osrm.org/route/v1/driving/{$pickupLng},{$pickupLat};{$dropoffLng},{$dropoffLat}", [
                        'overview' => 'full',
                        'geometries' => 'encodedpolyline',
                        'steps' => 'false',
                    ]);

                if ($response->successful()) {
                    $data = $response->json();
                    $route = $data['routes'][0] ?? null;

                    if ($route) {
                        return [
                            'distance_km' => round($route['distance'] / 1000, 2),
                            'duration_minutes' => round($route['duration'] / 60, 1),
                            'polyline' => $route['geometry'],
                        ];
                    }
                }

                Log::warning('OSRM route request failed, falling back to Haversine', [
                    'status' => $response->status(),
                ]);
            } catch (\Exception $e) {
                Log::warning('OSRM route request exception, falling back to Haversine', [
                    'message' => $e->getMessage(),
                ]);
            }

            return $this->haversineEstimate($pickupLat, $pickupLng, $dropoffLat, $dropoffLng);
        });
    }

    private function haversineEstimate(float $lat1, float $lng1, float $lat2, float $lng2): array
    {
        $lat1 = deg2rad($lat1);
        $lng1 = deg2rad($lng1);
        $lat2 = deg2rad($lat2);
        $lng2 = deg2rad($lng2);

        $dlat = $lat2 - $lat1;
        $dlng = $lng2 - $lng1;

        $a = sin($dlat / 2) ** 2 + cos($lat1) * cos($lat2) * sin($dlng / 2) ** 2;
        $c = 2 * asin(sqrt($a));

        $distanceKm = self::EARTH_RADIUS_KM * $c;

        return [
            'distance_km' => round($distanceKm, 2),
            'duration_minutes' => round($distanceKm * 2, 1),
            'polyline' => '',
        ];
    }
}

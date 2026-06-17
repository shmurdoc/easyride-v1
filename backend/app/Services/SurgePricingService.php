<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class SurgePricingService
{
    private const CACHE_PREFIX = 'surge:';

    private const DEFAULT_SURGE = 1.0;

    private const MAX_SURGE = 3.0;

    public function getCurrentSurge(float $lat, float $lng, string $category = 'standard'): float
    {
        $zone = $this->getZone($lat, $lng);
        $cacheKey = self::CACHE_PREFIX.$zone.':'.$category;

        return Cache::remember($cacheKey, 300, function () use ($lat, $lng, $zone, $category) {
            return $this->calculateSurge($lat, $lng, $zone, $category);
        });
    }

    private function calculateSurge(float $lat, float $lng, string $zone, string $category): float
    {
        $demand = $this->getDemandCount($lat, $lng, $radiusKm = 5);
        $supply = $this->getSupplyCount($lat, $lng, $radiusKm = 5);

        if ($supply === 0) {
            return self::MAX_SURGE;
        }

        $ratio = $demand / max($supply, 1);

        if ($ratio < 1.0) {
            return 1.0;
        }
        if ($ratio < 1.5) {
            return 1.2;
        }
        if ($ratio < 2.0) {
            return 1.5;
        }
        if ($ratio < 2.5) {
            return 1.8;
        }
        if ($ratio < 3.0) {
            return 2.0;
        }
        if ($ratio < 4.0) {
            return 2.5;
        }

        return self::MAX_SURGE;
    }

    private function getDemandCount(float $lat, float $lng, float $radiusKm): int
    {
        $earthRadius = 6371;
        $deltaLat = $radiusKm / $earthRadius * (180 / M_PI);
        $deltaLng = $radiusKm / ($earthRadius * cos(deg2rad($lat))) * (180 / M_PI);

        return DB::table('rides')
            ->where('status', 'searching')
            ->whereBetween('pickup_latitude', [$lat - $deltaLat, $lat + $deltaLat])
            ->whereBetween('pickup_longitude', [$lng - $deltaLng, $lng + $deltaLng])
            ->count();
    }

    private function getSupplyCount(float $lat, float $lng, float $radiusKm): int
    {
        $earthRadius = 6371;
        $deltaLat = $radiusKm / $earthRadius * (180 / M_PI);
        $deltaLng = $radiusKm / ($earthRadius * cos(deg2rad($lat))) * (180 / M_PI);

        return DB::table('users')
            ->where('is_online', true)
            ->join('driver_profiles', 'users.id', '=', 'driver_profiles.user_id')
            ->where('driver_profiles.is_approved', true)
            ->whereBetween('users.current_latitude', [$lat - $deltaLat, $lat + $deltaLat])
            ->whereBetween('users.current_longitude', [$lng - $deltaLng, $lng + $deltaLng])
            ->count();
    }

    private function getZone(float $lat, float $lng): string
    {
        $zones = [
            'cbd' => ['lat' => -23.9468, 'lng' => 29.4726, 'radius' => 2],
            'airport' => ['lat' => -23.9300, 'lng' => 29.4500, 'radius' => 3],
            'township' => ['lat' => -23.9600, 'lng' => 29.4900, 'radius' => 4],
        ];

        foreach ($zones as $name => $zone) {
            $distance = $this->haversine($lat, $lng, $zone['lat'], $zone['lng']);
            if ($distance <= $zone['radius']) {
                return $name;
            }
        }

        return 'default';
    }

    private function haversine(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;

        return $earthRadius * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }

    public function setManualSurge(string $zone, float $multiplier): void
    {
        $multiplier = max(1.0, min(self::MAX_SURGE, $multiplier));
        Cache::put(self::CACHE_PREFIX.$zone.':manual', $multiplier, 3600);
    }

    public function clearSurge(string $zone): void
    {
        Cache::forget(self::CACHE_PREFIX.$zone.':manual');
        Cache::forget(self::CACHE_PREFIX.$zone);
    }
}

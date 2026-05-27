<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\PromoCode;
use App\Models\Ride;
use App\Models\SystemSetting;

class FareCalculationService
{
    private const float EARTH_RADIUS_KM = 6371.0;

    private const array CATEGORY_RATES = [
        'economy' => ['base' => 25, 'per_km' => 12, 'per_min' => 2, 'min' => 35],
        'standard' => ['base' => 35, 'per_km' => 15, 'per_min' => 3, 'min' => 50],
        'premium' => ['base' => 55, 'per_km' => 22, 'per_min' => 5, 'min' => 80],
        'delivery' => ['base' => 20, 'per_km' => 10, 'per_min' => 1, 'min' => 30],
    ];

    public function calculate(
        float $pickupLat,
        float $pickupLng,
        float $dropoffLat,
        float $dropoffLng,
        string $category = 'standard',
    ): array {
        $distanceKm = $this->haversineDistance($pickupLat, $pickupLng, $dropoffLat, $dropoffLng);
        $durationMinutes = $distanceKm * 3;

        return $this->calculateFare($distanceKm, $durationMinutes, $category);
    }

    public function calculateFinalFare(Ride $ride): float
    {
        if ((float) $ride->total_fare > 0) {
            return (float) $ride->total_fare;
        }

        return 50.0;
    }

    private function haversineDistance(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $lat1 = deg2rad($lat1);
        $lng1 = deg2rad($lng1);
        $lat2 = deg2rad($lat2);
        $lng2 = deg2rad($lng2);

        $dlat = $lat2 - $lat1;
        $dlng = $lng2 - $lng1;

        $a = sin($dlat / 2) ** 2 + cos($lat1) * cos($lat2) * sin($dlng / 2) ** 2;
        $c = 2 * asin(sqrt($a));

        return self::EARTH_RADIUS_KM * $c;
    }

    public function calculateFare(
        float $distanceKm,
        float $durationMinutes,
        string $category = 'standard',
        ?float $surgeMultiplier = null,
        ?PromoCode $promoCode = null,
    ): array {
        $rates = $this->getFareRates($category);

        $surgeMultiplier ??= 1.0;
        $billedKm = max($distanceKm, 1.0);

        $distanceFare = $billedKm * $rates->per_km_rate;
        $timeFare = $durationMinutes * $rates->per_minute_rate;
        $subtotal = $rates->base_fare + $distanceFare + $timeFare;

        if ($subtotal < $rates->minimum_fare) {
            $subtotal = $rates->minimum_fare;
        }

        $subtotal *= $surgeMultiplier;

        $discount = 0.0;
        $promoId = null;

        if ($promoCode !== null) {
            $applied = $this->applyDiscount($promoCode, $subtotal);
            $discount = $applied['discount'];
            $promoId = $promoCode->id;
        }

        $totalFare = max($subtotal - $discount, 0.0);

        return [
            'base_fare' => $rates->base_fare,
            'per_km_fare' => $rates->per_km_rate,
            'distance_fare' => round($distanceFare, 2),
            'time_fare' => round($timeFare, 2),
            'surge_multiplier' => round($surgeMultiplier, 2),
            'subtotal' => round($subtotal, 2),
            'discount' => round($discount, 2),
            'promo_id' => $promoId,
            'total_fare' => round($totalFare, 2),
        ];
    }

    public function getFareRates(string $category = 'standard'): object
    {
        $defaults = self::CATEGORY_RATES[$category] ?? self::CATEGORY_RATES['standard'];

        $baseFare = SystemSetting::where('key', "fare_{$category}_base_fare")->value('value')
            ?? (string) $defaults['base'];
        $perKmRate = SystemSetting::where('key', "fare_{$category}_per_km_rate")->value('value')
            ?? (string) $defaults['per_km'];
        $perMinuteRate = SystemSetting::where('key', "fare_{$category}_per_minute_rate")->value('value')
            ?? (string) $defaults['per_min'];
        $minimumFare = SystemSetting::where('key', "fare_{$category}_minimum_fare")->value('value')
            ?? (string) $defaults['min'];

        return (object) [
            'base_fare' => (float) $baseFare,
            'per_km_rate' => (float) $perKmRate,
            'per_minute_rate' => (float) $perMinuteRate,
            'minimum_fare' => (float) $minimumFare,
        ];
    }

    public function calculateSurge(int $nearbyDrivers, int $nearbyRiders): float
    {
        if ($nearbyDrivers === 0) {
            return 2.5;
        }

        $ratio = $nearbyRiders / $nearbyDrivers;

        return round(min(max(1.0 + ($ratio * 0.3), 1.0), 2.5), 2);
    }

    private function applyDiscount(PromoCode $promo, float $subtotal): array
    {
        $discount = $promo->type === 'percentage'
            ? $subtotal * ($promo->value / 100)
            : $promo->value;

        if ($promo->max_discount > 0 && $discount > $promo->max_discount) {
            $discount = $promo->max_discount;
        }

        return [
            'discount' => round($discount, 2),
            'type' => $promo->type,
        ];
    }
}

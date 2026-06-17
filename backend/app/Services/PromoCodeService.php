<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\PromoCode;
use Illuminate\Database\Eloquent\Collection;

class PromoCodeService
{
    public function validateCode(string $code, ?string $tenantId = null, ?float $rideAmount = null): PromoCode
    {
        $query = PromoCode::where('code', $code)->where('is_active', true);

        if ($tenantId !== null) {
            $query->where(fn ($q) => $q->where('tenant_id', $tenantId)->orWhereNull('tenant_id'));
        }

        $promo = $query->first();

        if ($promo === null) {
            throw new \RuntimeException('Invalid or inactive promo code.');
        }

        if ($promo->expires_at !== null && $promo->expires_at->isPast()) {
            throw new \RuntimeException('Promo code has expired.');
        }

        if ($promo->starts_at !== null && $promo->starts_at->isFuture()) {
            throw new \RuntimeException('Promo code is not yet active.');
        }

        if ($promo->max_uses > 0 && $promo->used_count >= $promo->max_uses) {
            throw new \RuntimeException('Promo code usage limit reached.');
        }

        if ($rideAmount !== null && $promo->min_ride_amount > 0 && $rideAmount < $promo->min_ride_amount) {
            throw new \RuntimeException("Minimum ride amount of {$promo->min_ride_amount} not met.");
        }

        return $promo;
    }

    public function applyDiscount(PromoCode $promo, float $rideAmount): array
    {
        $value = (float) $promo->value;
        $maxDiscount = (float) ($promo->max_discount ?? 0);
        $discount = $promo->type === 'percentage'
            ? $rideAmount * ($value / 100)
            : $value;

        if ($maxDiscount > 0 && $discount > $maxDiscount) {
            $discount = $maxDiscount;
        }

        return [
            'discount' => round($discount, 2),
            'type' => $promo->type,
        ];
    }

    public function incrementUsage(PromoCode $promo): void
    {
        $promo->increment('used_count');
    }

    public function getActiveCodes(?string $tenantId = null): Collection
    {
        $query = PromoCode::where('is_active', true)
            ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->where(fn ($q) => $q->where('max_uses', 0)->orWhereColumn('used_count', '<', 'max_uses'));

        if ($tenantId !== null) {
            $query->where(fn ($q) => $q->where('tenant_id', $tenantId)->orWhereNull('tenant_id'));
        }

        return $query->get();
    }
}

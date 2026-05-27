<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Delivery;
use App\Models\Ride;
use Illuminate\Database\Eloquent\Collection;

class DeliveryService
{
    public function createDelivery(array $data): Delivery
    {
        return Delivery::create($data);
    }

    public function updateStatus(Delivery $delivery, string $status): Delivery
    {
        $timestamps = match ($status) {
            'picked_up' => ['picked_up_at' => now()],
            'delivered' => ['delivered_at' => now()],
            default => [],
        };

        $delivery->update(['status' => $status, ...$timestamps]);

        return $delivery->fresh();
    }

    public function assignToRide(Delivery $delivery, Ride $ride): Delivery
    {
        $delivery->update(['ride_id' => $ride->id]);

        return $delivery->fresh();
    }

    public function getActiveDeliveries(?string $tenantId = null): Collection
    {
        $query = Delivery::whereNotIn('status', ['delivered', 'cancelled']);

        if ($tenantId !== null) {
            $query->where('tenant_id', $tenantId);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }
}

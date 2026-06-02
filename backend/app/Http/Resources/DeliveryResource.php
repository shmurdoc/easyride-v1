<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DeliveryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tenant_id' => $this->tenant_id,
            'sender_id' => $this->sender_id,
            'driver_id' => $this->driver_id,
            'ride_id' => $this->ride_id,
            'status' => $this->status,
            'item_description' => $this->item_description,
            'item_value' => $this->item_value,
            'recipient_name' => $this->recipient_name,
            'recipient_phone' => $this->recipient_phone,
            'pickup_address' => $this->pickup_address,
            'pickup_lat' => $this->pickup_lat,
            'pickup_lng' => $this->pickup_lng,
            'dropoff_address' => $this->dropoff_address,
            'dropoff_lat' => $this->dropoff_lat,
            'dropoff_lng' => $this->dropoff_lng,
            'payment_method' => $this->payment_method,
            'payment_status' => $this->payment_status,
            'fare_amount' => $this->fare_amount,
            'notes' => $this->notes,
            'picked_up_at' => $this->picked_up_at?->toISOString(),
            'delivered_at' => $this->delivered_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'sender' => new UserResource($this->whenLoaded('sender')),
            'driver' => new UserResource($this->whenLoaded('driver')),
            'ride' => new RideResource($this->whenLoaded('ride')),
        ];
    }
}

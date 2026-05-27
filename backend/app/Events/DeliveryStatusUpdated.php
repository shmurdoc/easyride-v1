<?php

namespace App\Events;

use App\Models\Delivery;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class DeliveryStatusUpdated implements ShouldBroadcast
{
    public function __construct(
        public Delivery $delivery,
        public string $oldStatus,
        public string $newStatus
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('deliveries.' . $this->delivery->id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'delivery_id' => $this->delivery->id,
            'ride_id' => $this->delivery->ride_id,
            'old_status' => $this->oldStatus,
            'new_status' => $this->newStatus,
            'type' => $this->delivery->type,
            'description' => $this->delivery->description,
        ];
    }
}

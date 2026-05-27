<?php

namespace App\Events;

use App\Models\Ride;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class RideCancelled implements ShouldBroadcast
{
    public function __construct(
        public Ride $ride,
        public string $reason
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('rides.' . $this->ride->id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'ride_id' => $this->ride->id,
            'status' => $this->ride->status,
            'reason' => $this->reason,
            'cancelled_by' => $this->ride->cancelled_by,
            'cancelled_at' => $this->ride->cancelled_at,
        ];
    }
}

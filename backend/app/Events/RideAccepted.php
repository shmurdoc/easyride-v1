<?php

declare(strict_types=1);

namespace App\Events;

use App\Models\Ride;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RideAccepted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Ride $ride,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('ride:' . $this->ride->id),
            new Channel('user:' . $this->ride->rider_id),
            new Channel('admin'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'ride.accepted';
    }

    public function broadcastWith(): array
    {
        return [
            'ride_id' => $this->ride->id,
            'driver_id' => $this->ride->driver_id,
            'status' => $this->ride->status,
            'driver_eta' => $this->ride->driver_eta,
            'timestamp' => now()->toISOString(),
        ];
    }
}

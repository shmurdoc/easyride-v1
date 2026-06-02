<?php

declare(strict_types=1);

namespace App\Events;

use App\Models\Ride;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RideCompleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Ride $ride,
    ) {}

    public function broadcastOn(): array
    {
        $channels = [
            new Channel('ride:' . $this->ride->id),
            new Channel('admin'),
        ];

        if ($this->ride->rider_id) {
            $channels[] = new Channel('user:' . $this->ride->rider_id);
        }
        if ($this->ride->driver_id) {
            $channels[] = new Channel('user:' . $this->ride->driver_id);
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'ride.completed';
    }

    public function broadcastWith(): array
    {
        return [
            'ride_id' => $this->ride->id,
            'total_fare' => $this->ride->total_fare,
            'status' => $this->ride->status,
            'timestamp' => now()->toISOString(),
        ];
    }
}

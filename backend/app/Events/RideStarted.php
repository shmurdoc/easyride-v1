<?php

declare(strict_types=1);

namespace App\Events;

use App\Models\Ride;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RideStarted implements ShouldBroadcast
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
        return 'ride.started';
    }

    public function broadcastWith(): array
    {
        return [
            'ride_id' => $this->ride->id,
            'started_at' => $this->ride->started_at?->toISOString(),
            'timestamp' => now()->toISOString(),
        ];
    }
}

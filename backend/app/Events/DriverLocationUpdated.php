<?php

declare(strict_types=1);

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DriverLocationUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $driverId,
        public float $latitude,
        public float $longitude,
        public ?string $rideId = null,
    ) {}

    public function broadcastOn(): array
    {
        $channels = [
            new Channel('driver:'.$this->driverId),
        ];

        if ($this->rideId !== null) {
            $channels[] = new Channel('ride:'.$this->rideId);
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'driver.location';
    }

    public function broadcastWith(): array
    {
        return [
            'driver_id' => $this->driverId,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'ride_id' => $this->rideId,
            'timestamp' => now()->toISOString(),
        ];
    }
}

<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class DriverLocationUpdated implements ShouldBroadcast
{
    public function __construct(
        public string $driverId,
        public float $latitude,
        public float $longitude,
        public ?string $rideId = null
    ) {}

    public function broadcastOn(): array
    {
        $channels = [
            new PrivateChannel('drivers.' . $this->driverId . '.tracking'),
        ];

        if ($this->rideId !== null) {
            $channels[] = new PrivateChannel('rides.' . $this->rideId);
        }

        return $channels;
    }

    public function broadcastWith(): array
    {
        return [
            'driver_id' => $this->driverId,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'ride_id' => $this->rideId,
        ];
    }
}

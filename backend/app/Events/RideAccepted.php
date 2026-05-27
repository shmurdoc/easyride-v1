<?php

namespace App\Events;

use App\Models\Ride;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class RideAccepted implements ShouldBroadcast
{
    public function __construct(
        public Ride $ride
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('rides.' . $this->ride->id),
            new PrivateChannel('riders.' . $this->ride->rider_id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'ride_id' => $this->ride->id,
            'driver_id' => $this->ride->driver_id,
            'status' => $this->ride->status,
            'driver_eta' => $this->ride->driver_eta,
            'vehicle' => $this->ride->driver?->vehicle ? [
                'make' => $this->ride->driver->vehicle->make,
                'model' => $this->ride->driver->vehicle->model,
                'color' => $this->ride->driver->vehicle->color,
                'plate_number' => $this->ride->driver->vehicle->plate_number,
            ] : null,
        ];
    }
}

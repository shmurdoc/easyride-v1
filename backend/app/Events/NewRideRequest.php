<?php

namespace App\Events;

use App\Models\Ride;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewRideRequest implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;
    public function __construct(
        public Ride $ride,
        public array $nearbyDriverIds = []
    ) {}

    public function broadcastOn(): array
    {
        $channels = [
            new PrivateChannel('rides.' . $this->ride->id),
        ];

        foreach ($this->nearbyDriverIds as $driverId) {
            $channels[] = new PrivateChannel('drivers.' . $driverId);
        }

        return $channels;
    }

    public function broadcastWith(): array
    {
        return [
            'ride_id' => $this->ride->id,
            'pickup_latitude' => $this->ride->pickup_latitude,
            'pickup_longitude' => $this->ride->pickup_longitude,
            'pickup_address' => $this->ride->pickup_address,
            'dropoff_address' => $this->ride->dropoff_address,
            'category' => $this->ride->category,
            'distance_km' => $this->ride->distance_km,
            'status' => $this->ride->status,
        ];
    }
}

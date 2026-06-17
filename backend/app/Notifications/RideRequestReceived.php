<?php

namespace App\Notifications;

use App\Models\Ride;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class RideRequestReceived extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected Ride $ride
    ) {
        $this->onQueue('horizon');
    }

    public function via(object $notifiable): array
    {
        return ['broadcast', 'database'];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'ride_id' => $this->ride->id,
            'pickup_address' => $this->ride->pickup_address,
            'dropoff_address' => $this->ride->dropoff_address,
            'category' => $this->ride->category,
            'distance_km' => $this->ride->distance_km,
            'type' => 'ride.request',
        ]);
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'ride_id' => $this->ride->id,
            'pickup_address' => $this->ride->pickup_address,
            'dropoff_address' => $this->ride->dropoff_address,
            'category' => $this->ride->category,
            'distance_km' => $this->ride->distance_km,
        ];
    }

    public function broadcastType(): string
    {
        return 'ride.request';
    }
}

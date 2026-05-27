<?php

namespace App\Events;

use App\Models\Ride;
use App\Models\Payment;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class RideCompleted implements ShouldBroadcast
{
    public function __construct(
        public Ride $ride,
        public Payment $payment
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
            'completed_at' => $this->ride->completed_at,
            'total_fare' => $this->ride->total_fare,
            'distance_km' => $this->ride->distance_km,
            'duration_minutes' => $this->ride->duration_minutes,
            'payment' => [
                'id' => $this->payment->id,
                'amount' => $this->payment->amount,
                'status' => $this->payment->status,
                'payment_method' => $this->payment->payment_method,
            ],
        ];
    }
}

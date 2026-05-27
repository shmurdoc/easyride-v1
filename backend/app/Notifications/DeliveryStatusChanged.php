<?php

namespace App\Notifications;

use App\Models\Delivery;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class DeliveryStatusChanged extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected Delivery $delivery
    )
    {
        $this->onQueue('horizon');
    }

    public function via(object $notifiable): array
    {
        return ['broadcast', 'database'];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'delivery_id' => $this->delivery->id,
            'ride_id' => $this->delivery->ride_id,
            'status' => $this->delivery->status,
            'type' => $this->delivery->type,
            'description' => $this->delivery->description,
        ]);
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'delivery_id' => $this->delivery->id,
            'ride_id' => $this->delivery->ride_id,
            'status' => $this->delivery->status,
            'type' => $this->delivery->type,
            'description' => $this->delivery->description,
        ];
    }
}

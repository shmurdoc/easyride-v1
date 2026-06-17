<?php

declare(strict_types=1);

namespace App\Events;

use App\Models\Delivery;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DeliveryStatusUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Delivery $delivery,
        public string $oldStatus,
        public string $newStatus,
    ) {}

    public function broadcastOn(): array
    {
        $channels = [
            new Channel('delivery:'.$this->delivery->id),
            new Channel('admin'),
        ];

        if ($this->delivery->sender_id) {
            $channels[] = new Channel('user:'.$this->delivery->sender_id);
        }
        if ($this->delivery->driver_id) {
            $channels[] = new Channel('user:'.$this->delivery->driver_id);
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'delivery.status';
    }

    public function broadcastWith(): array
    {
        return [
            'delivery_id' => $this->delivery->id,
            'old_status' => $this->oldStatus,
            'new_status' => $this->newStatus,
            'timestamp' => now()->toISOString(),
        ];
    }
}

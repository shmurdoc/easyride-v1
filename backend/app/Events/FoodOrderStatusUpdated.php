<?php

declare(strict_types=1);

namespace App\Events;

use App\Models\FoodOrder;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FoodOrderStatusUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public FoodOrder $order,
    ) {}

    public function broadcastOn(): array
    {
        $channels = [
            new Channel('food-order:' . $this->order->id),
            new Channel('admin'),
        ];

        if ($this->order->customer_id) {
            $channels[] = new Channel('user:' . $this->order->customer_id);
        }
        if ($this->order->driver_id) {
            $channels[] = new Channel('user:' . $this->order->driver_id);
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'food-order.status';
    }

    public function broadcastWith(): array
    {
        return [
            'order_id' => $this->order->id,
            'restaurant_name' => $this->order->restaurant?->name,
            'status' => $this->order->status,
            'total_amount' => $this->order->total_amount,
            'timestamp' => now()->toISOString(),
        ];
    }
}

<?php

declare(strict_types=1);

namespace App\Services\Food;

use App\Events\FoodOrderStatusUpdated;
use App\Models\FoodOrder;
use App\Models\FoodOrderItem;
use App\Models\MenuItem;
use Illuminate\Support\Facades\DB;

class FoodOrderService
{
    public function createOrder(array $data, string $customerId): FoodOrder
    {
        return DB::transaction(function () use ($data, $customerId) {
            $items = MenuItem::whereIn('id', collect($data['items'])->pluck('menu_item_id'))->get()->keyBy('id');

            $subtotal = collect($data['items'])->sum(function ($item) use ($items) {
                return ($items[$item['menu_item_id']]->price ?? 0) * $item['quantity'];
            });

            $deliveryFee = $data['delivery_fee'] ?? 25;
            $serviceFee = round($subtotal * 0.05, 2);
            $total = $subtotal + $deliveryFee + $serviceFee;

            $order = FoodOrder::create([
                'restaurant_id' => $data['restaurant_id'],
                'customer_id' => $customerId,
                'status' => 'pending',
                'subtotal' => $subtotal,
                'delivery_fee' => $deliveryFee,
                'service_fee' => $serviceFee,
                'total_amount' => $total,
                'delivery_address' => $data['delivery_address'],
                'delivery_latitude' => $data['delivery_lat'],
                'delivery_longitude' => $data['delivery_lng'],
                'payment_method' => $data['payment_method'],
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($data['items'] as $item) {
                $menuItem = $items[$item['menu_item_id']] ?? null;
                FoodOrderItem::create([
                    'food_order_id' => $order->id,
                    'menu_item_id' => $item['menu_item_id'],
                    'name' => $menuItem->name ?? 'Unknown',
                    'price' => $menuItem->price ?? 0,
                    'quantity' => $item['quantity'],
                    'line_total' => ($menuItem->price ?? 0) * $item['quantity'],
                ]);
            }

            event(new FoodOrderStatusUpdated($order));

            return $order->load('items');
        });
    }

    public function updateStatus(string $orderId, string $status): FoodOrder
    {
        $order = FoodOrder::findOrFail($orderId);
        $order->update(['status' => $status]);
        event(new FoodOrderStatusUpdated($order));

        return $order->fresh()->load(['items', 'restaurant', 'customer', 'driver']);
    }

    public function assignDriver(string $orderId, string $driverId): FoodOrder
    {
        $order = FoodOrder::findOrFail($orderId);
        $order->update(['driver_id' => $driverId, 'status' => 'confirmed']);
        event(new FoodOrderStatusUpdated($order));

        return $order->fresh()->load(['items', 'restaurant', 'customer', 'driver']);
    }
}

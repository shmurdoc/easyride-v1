<?php

namespace Database\Factories;

use App\Models\FoodOrder;
use App\Models\Restaurant;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class FoodOrderFactory extends Factory
{
    protected $model = FoodOrder::class;

    public function definition(): array
    {
        $subtotal = fake()->randomFloat(2, 30, 200);
        $deliveryFee = fake()->randomFloat(2, 0, 40);
        $serviceFee = round($subtotal * 0.05, 2);
        $tipAmount = fake()->randomFloat(2, 0, 30);
        $total = round($subtotal + $deliveryFee + $serviceFee + $tipAmount, 2);

        return [
            'tenant_id' => Tenant::factory(),
            'restaurant_id' => Restaurant::factory(),
            'customer_id' => User::factory(),
            'driver_id' => null,
            'status' => 'pending',
            'subtotal' => $subtotal,
            'delivery_fee' => $deliveryFee,
            'service_fee' => $serviceFee,
            'tip_amount' => $tipAmount,
            'total_amount' => $total,
            'delivery_address' => fake()->address(),
            'delivery_latitude' => fake()->latitude(-33.5, -34.5),
            'delivery_longitude' => fake()->longitude(18.0, 19.0),
            'delivery_notes' => fake()->optional()->sentence(),
            'estimated_delivery_at' => now()->addMinutes(30),
            'payment_method' => fake()->randomElement(['wallet', 'cash', 'stripe']),
            'payment_status' => 'pending',
            'rating' => null,
            'rating_comment' => null,
        ];
    }
}

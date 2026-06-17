<?php

namespace Database\Factories;

use App\Models\Delivery;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class DeliveryFactory extends Factory
{
    protected $model = Delivery::class;

    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'sender_id' => User::factory(),
            'pickup_address' => fake()->address(),
            'dropoff_address' => fake()->address(),
            'status' => 'pending',
        ];
    }
}

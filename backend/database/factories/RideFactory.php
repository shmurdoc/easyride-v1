<?php

namespace Database\Factories;

use App\Models\Ride;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class RideFactory extends Factory
{
    protected $model = Ride::class;

    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'rider_id' => User::factory(),
            'pickup_latitude' => fake()->latitude(-23.95, -23.94),
            'pickup_longitude' => fake()->longitude(29.46, 29.48),
            'dropoff_latitude' => fake()->latitude(-23.96, -23.94),
            'dropoff_longitude' => fake()->longitude(29.47, 29.49),
            'pickup_address' => fake()->address(),
            'dropoff_address' => fake()->address(),
            'status' => 'searching',
            'category' => 'standard',
            'total_fare' => fake()->randomFloat(2, 30, 200),
        ];
    }
}

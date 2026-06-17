<?php

namespace Database\Factories;

use App\Models\Restaurant;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

class RestaurantFactory extends Factory
{
    protected $model = Restaurant::class;

    public function definition(): array
    {
        $cuisines = ['Italian', 'Chinese', 'Indian', 'Mexican', 'Japanese', 'Thai', 'American', 'Mediterranean'];

        return [
            'tenant_id' => Tenant::factory(),
            'name' => fake()->company().' '.fake()->randomElement(['Restaurant', 'Kitchen', 'Cafe', 'Bistro']),
            'slug' => fake()->unique()->slug(2),
            'description' => fake()->sentence(),
            'image_url' => null,
            'phone' => fake()->phoneNumber(),
            'email' => fake()->companyEmail(),
            'address' => fake()->address(),
            'latitude' => fake()->latitude(-33.5, -34.5),
            'longitude' => fake()->longitude(18.0, 19.0),
            'cuisine_type' => fake()->randomElement($cuisines),
            'price_range' => fake()->randomElement(['$', '$$', '$$$']),
            'delivery_fee' => fake()->randomFloat(2, 0, 50),
            'minimum_order' => fake()->randomFloat(2, 20, 100),
            'estimated_delivery_minutes' => fake()->numberBetween(15, 60),
            'is_active' => true,
            'is_featured' => fake()->boolean(20),
            'opens_at' => '08:00',
            'closes_at' => '22:00',
            'rating' => 0,
            'rating_count' => 0,
            'total_orders' => 0,
        ];
    }

    public function closed(): static
    {
        return $this->state(fn (array $attributes) => [
            'opens_at' => '09:00',
            'closes_at' => '09:00',
        ]);
    }
}

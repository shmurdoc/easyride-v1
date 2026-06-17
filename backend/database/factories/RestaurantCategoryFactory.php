<?php

namespace Database\Factories;

use App\Models\Restaurant;
use App\Models\RestaurantCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

class RestaurantCategoryFactory extends Factory
{
    protected $model = RestaurantCategory::class;

    public function definition(): array
    {
        return [
            'restaurant_id' => Restaurant::factory(),
            'name' => fake()->randomElement(['Starters', 'Mains', 'Desserts', 'Beverages', 'Sides', 'Specials']),
            'sort_order' => fake()->numberBetween(0, 10),
            'is_active' => true,
        ];
    }
}

<?php

namespace Database\Factories;

use App\Models\MenuItem;
use App\Models\Restaurant;
use App\Models\RestaurantCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

class MenuItemFactory extends Factory
{
    protected $model = MenuItem::class;

    public function definition(): array
    {
        return [
            'restaurant_id' => Restaurant::factory(),
            'category_id' => RestaurantCategory::factory(),
            'name' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'price' => fake()->randomFloat(2, 5, 150),
            'image_url' => null,
            'is_available' => true,
            'is_active' => true,
            'is_vegetarian' => fake()->boolean(30),
            'is_vegan' => fake()->boolean(10),
            'is_gluten_free' => fake()->boolean(10),
            'spice_level' => fake()->numberBetween(0, 5),
            'preparation_time_minutes' => fake()->numberBetween(5, 30),
            'calories' => fake()->numberBetween(100, 1200),
            'sort_order' => fake()->numberBetween(0, 50),
        ];
    }
}

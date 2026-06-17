<?php

namespace Database\Factories;

use App\Models\FoodOrder;
use App\Models\FoodOrderItem;
use App\Models\MenuItem;
use Illuminate\Database\Eloquent\Factories\Factory;

class FoodOrderItemFactory extends Factory
{
    protected $model = FoodOrderItem::class;

    public function definition(): array
    {
        $quantity = fake()->numberBetween(1, 5);
        $price = fake()->randomFloat(2, 10, 100);

        return [
            'food_order_id' => FoodOrder::factory(),
            'menu_item_id' => MenuItem::factory(),
            'name' => fake()->words(3, true),
            'price' => $price,
            'quantity' => $quantity,
            'special_instructions' => fake()->optional()->sentence(),
            'line_total' => round($price * $quantity, 2),
        ];
    }
}

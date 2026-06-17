<?php

namespace Database\Factories;

use App\Models\Ride;
use App\Models\RideChatMessage;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class RideChatMessageFactory extends Factory
{
    protected $model = RideChatMessage::class;

    public function definition(): array
    {
        return [
            'ride_id' => Ride::factory(),
            'sender_id' => User::factory(),
            'message' => fake()->sentence(),
        ];
    }
}

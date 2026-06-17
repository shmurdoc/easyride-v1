<?php

namespace Database\Factories;

use App\Models\Payment;
use App\Models\Ride;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        return [
            'ride_id' => Ride::factory(),
            'payer_id' => User::factory(),
            'amount' => 100,
            'method' => 'cash',
            'gateway' => 'cash',
            'status' => 'completed',
            'paid_at' => now(),
        ];
    }
}

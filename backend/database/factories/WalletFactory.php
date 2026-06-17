<?php

namespace Database\Factories;

use App\Models\Tenant;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Database\Eloquent\Factories\Factory;

class WalletFactory extends Factory
{
    protected $model = Wallet::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'tenant_id' => Tenant::factory(),
            'balance' => 0,
            'pending_balance' => 0,
            'currency' => 'ZAR',
        ];
    }
}

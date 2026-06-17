<?php

namespace Database\Factories;

use App\Models\PromoCode;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

class PromoCodeFactory extends Factory
{
    protected $model = PromoCode::class;

    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'code' => strtoupper(fake()->lexify('??????')),
            'type' => 'flat',
            'value' => 50,
            'is_active' => true,
            'starts_at' => now()->subDay(),
            'expires_at' => now()->addMonth(),
        ];
    }
}

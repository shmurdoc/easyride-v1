<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConfigTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_get_platform_config(): void
    {
        $response = $this->getJson('/api/v1/config');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'platform' => ['name', 'currency', 'country', 'currency_symbol'],
                'ride_categories',
                'payment_methods',
                'surge',
                'matching',
                'features',
            ]);
    }

    public function test_config_contains_zar_currency(): void
    {
        $response = $this->getJson('/api/v1/config');

        $response->assertStatus(200)
            ->assertJsonPath('platform.currency', 'ZAR')
            ->assertJsonPath('platform.currency_symbol', 'R');
    }

    public function test_config_contains_ride_categories(): void
    {
        $response = $this->getJson('/api/v1/config');

        $response->assertStatus(200)
            ->assertJsonCount(5, 'ride_categories');
    }

    public function test_config_contains_payment_methods(): void
    {
        $response = $this->getJson('/api/v1/config');

        $response->assertStatus(200)
            ->assertJsonCount(4, 'payment_methods');
    }

    public function test_config_contains_features_section(): void
    {
        $response = $this->getJson('/api/v1/config');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'features' => ['ride_hailing', 'item_transport', 'food_delivery'],
            ]);
    }
}

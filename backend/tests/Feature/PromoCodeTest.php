<?php

namespace Tests\Feature;

use App\Models\PromoCode;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class PromoCodeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::create(['name' => 'rider', 'guard_name' => 'web']);
        Role::create(['name' => 'driver', 'guard_name' => 'web']);
        Role::create(['name' => 'admin', 'guard_name' => 'web']);
    }

    public function test_rider_can_create_promo_code(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('admin');
        Sanctum::actingAs($rider);

        $response = $this->postJson('/api/v1/promo-codes', [
            'code' => 'WELCOME10',
            'type' => 'percentage',
            'value' => 10.00,
            'max_uses' => 100,
            'expires_at' => now()->addDays(30)->toDateString(),
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('code', 'WELCOME10');
    }

    public function test_rider_can_list_promo_codes(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('admin');
        Sanctum::actingAs($rider);

        PromoCode::create([
            'tenant_id' => $rider->tenant_id,
            'code' => 'SAVE20',
            'type' => 'fixed',
            'value' => 20.00,
            'is_active' => true,
        ]);

        $response = $this->getJson('/api/v1/promo-codes');

        $response->assertStatus(200);
    }

    public function test_rider_can_show_promo_code(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        Sanctum::actingAs($rider);

        $promo = PromoCode::create([
            'tenant_id' => $rider->tenant_id,
            'code' => 'FLAT50',
            'type' => 'fixed',
            'value' => 50.00,
            'is_active' => true,
        ]);

        $response = $this->getJson("/api/v1/promo-codes/{$promo->id}");

        $response->assertStatus(200)
            ->assertJsonPath('code', 'FLAT50');
    }

    public function test_rider_can_update_promo_code(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        Sanctum::actingAs($rider);

        $promo = PromoCode::create([
            'tenant_id' => $rider->tenant_id,
            'code' => 'ORIGINAL',
            'type' => 'percentage',
            'value' => 5.00,
            'is_active' => true,
        ]);

        $response = $this->putJson("/api/v1/promo-codes/{$promo->id}", [
            'value' => 15.00,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('value', '15.00');
    }

    public function test_rider_can_delete_promo_code(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        Sanctum::actingAs($rider);

        $promo = PromoCode::create([
            'tenant_id' => $rider->tenant_id,
            'code' => 'DELETE99',
            'type' => 'fixed',
            'value' => 99.00,
            'is_active' => true,
        ]);

        $response = $this->deleteJson("/api/v1/promo-codes/{$promo->id}");

        $response->assertStatus(204);
    }

    public function test_create_promo_code_requires_unique_code(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        Sanctum::actingAs($rider);

        $this->postJson('/api/v1/promo-codes', [
            'code' => 'DUPLICATE',
            'type' => 'fixed',
            'value' => 10.00,
        ]);

        $response = $this->postJson('/api/v1/promo-codes', [
            'code' => 'DUPLICATE',
            'type' => 'fixed',
            'value' => 20.00,
        ]);

        $response->assertStatus(422);
    }

    public function test_validate_promo_code_public(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');

        PromoCode::create([
            'tenant_id' => $rider->tenant_id,
            'code' => 'PUBLIC10',
            'type' => 'percentage',
            'value' => 10.00,
            'is_active' => true,
            'starts_at' => now()->subDay(),
            'expires_at' => now()->addDays(30),
        ]);

        Sanctum::actingAs($rider);
        $response = $this->postJson('/api/v1/promo-codes/validate', [
            'code' => 'PUBLIC10',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('valid', true);
    }

    public function test_validate_invalid_promo_code(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        Sanctum::actingAs($rider);

        $response = $this->postJson('/api/v1/promo-codes/validate', [
            'code' => 'NONEXISTENT',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('valid', false);
    }

    public function test_unauthenticated_cannot_access_promo_codes(): void
    {
        $response = $this->getJson('/api/v1/promo-codes');
        $response->assertStatus(401);
    }
}

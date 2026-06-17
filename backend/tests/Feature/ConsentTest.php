<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ConsentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::create(['name' => 'rider', 'guard_name' => 'web']);
    }

    public function test_user_can_view_consents(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        Sanctum::actingAs($rider);

        $response = $this->getJson('/api/v1/consent');

        $response->assertStatus(200)
            ->assertJsonStructure(['consents']);
    }

    public function test_user_can_grant_consent(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        Sanctum::actingAs($rider);

        $response = $this->postJson('/api/v1/consent/grant', [
            'consent_type' => 'terms_of_service',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Consent granted');
    }

    public function test_user_can_revoke_consent(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        Sanctum::actingAs($rider);

        $this->postJson('/api/v1/consent/grant', [
            'consent_type' => 'marketing_email',
        ]);

        $response = $this->postJson('/api/v1/consent/revoke', [
            'consent_type' => 'marketing_email',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('message', 'Consent revoked');
    }

    public function test_user_can_view_consent_history(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        Sanctum::actingAs($rider);

        $this->postJson('/api/v1/consent/grant', [
            'consent_type' => 'privacy_policy',
        ]);

        $response = $this->getJson('/api/v1/consent/history');

        $response->assertStatus(200)
            ->assertJsonStructure(['history']);
    }

    public function test_grant_consent_validates_type(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        Sanctum::actingAs($rider);

        $response = $this->postJson('/api/v1/consent/grant', [
            'consent_type' => 'invalid_type',
        ]);

        $response->assertStatus(422);
    }

    public function test_unauthenticated_cannot_access_consent(): void
    {
        $response = $this->getJson('/api/v1/consent');
        $response->assertStatus(401);
    }
}

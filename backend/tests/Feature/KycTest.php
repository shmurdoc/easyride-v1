<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class KycTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::create(['name' => 'rider', 'guard_name' => 'web']);
        Role::create(['name' => 'admin', 'guard_name' => 'web']);
    }

    public function test_user_can_view_kyc_verifications(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        Sanctum::actingAs($rider);

        $response = $this->getJson('/api/v1/kyc/my');

        $response->assertOk()
            ->assertJsonStructure(['verifications']);
    }

    public function test_admin_can_view_pending_verifications(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/v1/admin/compliance/kyc/pending');

        $response->assertOk()
            ->assertJsonStructure(['verifications']);
    }

    public function test_non_admin_cannot_access_kyc_admin(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        Sanctum::actingAs($rider);

        $response = $this->getJson('/api/v1/admin/compliance/kyc/pending');

        $response->assertStatus(403);
    }

    public function test_unauthenticated_cannot_access_kyc(): void
    {
        $response = $this->getJson('/api/v1/kyc/my');

        $response->assertStatus(401);
    }
}

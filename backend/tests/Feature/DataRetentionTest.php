<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class DataRetentionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::create(['name' => 'rider', 'guard_name' => 'web']);
        Role::create(['name' => 'admin', 'guard_name' => 'web']);
    }

    public function test_user_can_export_data(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        Sanctum::actingAs($rider);

        $response = $this->getJson('/api/v1/data/export');

        $response->assertOk()
            ->assertJsonStructure(['data' => ['profile', 'rides', 'payments', 'consents', 'kyc']]);
    }

    public function test_admin_can_view_retention_info(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/v1/admin/compliance/data-retention');

        $response->assertOk()
            ->assertJsonStructure(['retention']);
    }

    public function test_non_admin_cannot_access_data_retention_admin(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        Sanctum::actingAs($rider);

        $response = $this->getJson('/api/v1/admin/compliance/data-retention');

        $response->assertStatus(403);
    }

    public function test_unauthenticated_cannot_export_data(): void
    {
        $response = $this->getJson('/api/v1/data/export');

        $response->assertStatus(401);
    }
}

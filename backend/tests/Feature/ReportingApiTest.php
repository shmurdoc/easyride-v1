<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ReportingApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::create(['name' => 'admin', 'guard_name' => 'web']);
    }

    public function test_admin_can_access_revenue_report(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/v1/admin/reports/revenue');

        $response->assertStatus(200);
    }

    public function test_admin_can_access_ride_report(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/v1/admin/reports/rides');

        $response->assertStatus(200);
    }

    public function test_admin_can_access_driver_report(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/v1/admin/reports/drivers');

        $response->assertStatus(200);
    }

    public function test_report_fails_without_authentication(): void
    {
        $response = $this->getJson('/api/v1/admin/reports/revenue');
        $response->assertStatus(401);
    }

    public function test_report_fails_for_non_admin(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/admin/reports/revenue');
        $response->assertStatus(403);
    }

    public function test_report_accepts_date_filters(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/v1/admin/reports/revenue?'.http_build_query([
            'date_from' => '2025-01-01',
            'date_to' => '2025-12-31',
        ]));

        $response->assertStatus(200);
    }

    public function test_report_export_returns_csv(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/v1/admin/reports/revenue/export');

        $response->assertStatus(200);
    }
}

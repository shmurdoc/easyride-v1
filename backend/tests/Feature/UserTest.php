<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::create(['name' => 'rider', 'guard_name' => 'web']);
        Role::create(['name' => 'driver', 'guard_name' => 'web']);
        Role::create(['name' => 'admin', 'guard_name' => 'web']);
    }

    public function test_rider_can_view_users_list(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        User::factory()->count(3)->create();
        Sanctum::actingAs($rider);

        $response = $this->getJson('/api/v1/users');

        $response->assertStatus(200)
            ->assertJsonCount(4, 'data');
    }

    public function test_rider_can_show_user(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        Sanctum::actingAs($rider);

        $response = $this->getJson("/api/v1/users/{$rider->id}");

        $response->assertStatus(200)
            ->assertJsonPath('id', $rider->id);
    }

    public function test_rider_can_update_own_profile(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        Sanctum::actingAs($rider);

        $response = $this->putJson("/api/v1/users/{$rider->id}", [
            'name' => 'Updated Name',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('name', 'Updated Name');
    }

    public function test_rider_can_delete_own_account(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        Sanctum::actingAs($rider);

        $response = $this->deleteJson("/api/v1/users/{$rider->id}");

        $response->assertStatus(204);
        $this->assertSoftDeleted('users', ['id' => $rider->id]);
    }

    public function test_admin_can_get_user_stats(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        User::factory()->count(3)->create();

        $response = $this->getJson('/api/v1/admin/stats');

        $response->assertStatus(200)
            ->assertJsonStructure(['total_users', 'total_riders', 'total_drivers', 'active_drivers']);
    }

    public function test_unauthenticated_cannot_access_users(): void
    {
        $response = $this->getJson('/api/v1/users');
        $response->assertStatus(401);
    }

    public function test_update_user_validates_email(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        Sanctum::actingAs($rider);

        $response = $this->putJson("/api/v1/users/{$rider->id}", [
            'email' => 'not-an-email',
        ]);

        $response->assertStatus(422);
    }
}

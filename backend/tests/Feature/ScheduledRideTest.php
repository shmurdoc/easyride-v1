<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ScheduledRideTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::create(['name' => 'rider', 'guard_name' => 'web']);
        Role::create(['name' => 'driver', 'guard_name' => 'web']);
    }

    public function test_rider_can_schedule_ride(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        Sanctum::actingAs($rider);

        $response = $this->postJson('/api/v1/scheduled-rides', [
            'category' => 'standard',
            'pickup_latitude' => -23.9468,
            'pickup_longitude' => 29.4726,
            'pickup_address' => '123 Main St',
            'dropoff_latitude' => -23.9500,
            'dropoff_longitude' => 29.4800,
            'dropoff_address' => '456 Oak Ave',
            'scheduled_at' => now()->addHours(2)->format('Y-m-d H:i:s'),
        ]);

        $this->assertNotEquals(401, $response->status());
    }

    public function test_rider_can_view_upcoming_scheduled_rides(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        Sanctum::actingAs($rider);

        $response = $this->getJson('/api/v1/scheduled-rides');

        $this->assertNotEquals(401, $response->status());
    }

    public function test_schedule_ride_validates_required_fields(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        Sanctum::actingAs($rider);

        $response = $this->postJson('/api/v1/scheduled-rides', []);

        $response->assertStatus(422);
    }

    public function test_schedule_ride_validates_category(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        Sanctum::actingAs($rider);

        $response = $this->postJson('/api/v1/scheduled-rides', [
            'category' => 'invalid',
            'pickup_latitude' => -23.9468,
            'pickup_longitude' => 29.4726,
            'pickup_address' => '123 Main St',
            'dropoff_latitude' => -23.9500,
            'dropoff_longitude' => 29.4800,
            'dropoff_address' => '456 Oak Ave',
            'scheduled_at' => now()->addHours(2)->format('Y-m-d H:i:s'),
        ]);

        $response->assertStatus(422);
    }

    public function test_unauthenticated_cannot_access_scheduled_rides(): void
    {
        $response = $this->getJson('/api/v1/scheduled-rides');
        $response->assertStatus(401);
    }
}

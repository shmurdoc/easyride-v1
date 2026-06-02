<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Ride;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RideTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::create(['name' => 'rider', 'guard_name' => 'web']);
        Role::create(['name' => 'driver', 'guard_name' => 'web']);
    }

    public function test_rider_can_create_ride(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        Sanctum::actingAs($rider);

        $response = $this->postJson('/api/v1/rides', [
            'pickup_latitude' => -23.9468,
            'pickup_longitude' => 29.4726,
            'pickup_address' => 'Phalaborwa CBD',
            'dropoff_latitude' => -23.9500,
            'dropoff_longitude' => 29.4800,
            'dropoff_address' => 'Phalaborwa Airport',
            'category' => 'standard',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['ride' => ['id', 'status', 'total_fare']]);

        $this->assertDatabaseHas('rides', [
            'rider_id' => $rider->id,
            'status' => 'searching',
        ]);
    }

    public function test_rider_can_get_current_ride(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        Sanctum::actingAs($rider);

        $ride = Ride::create([
            'rider_id' => $rider->id,
            'status' => 'searching',
            'category' => 'standard',
            'pickup_latitude' => -23.9468,
            'pickup_longitude' => 29.4726,
            'pickup_address' => '123 Main St',
            'dropoff_latitude' => -23.9500,
            'dropoff_longitude' => 29.4800,
            'dropoff_address' => '456 Oak Ave',
            'total_fare' => 150.00,
        ]);

        $response = $this->getJson('/api/v1/rides/current');

        $response->assertStatus(200)
            ->assertJsonPath('id', $ride->id);
    }

    public function test_rider_can_cancel_ride(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        Sanctum::actingAs($rider);

        $ride = Ride::create([
            'rider_id' => $rider->id,
            'status' => 'searching',
            'category' => 'standard',
            'pickup_latitude' => -23.9468,
            'pickup_longitude' => 29.4726,
            'pickup_address' => '123 Main St',
            'dropoff_latitude' => -23.9500,
            'dropoff_longitude' => 29.4800,
            'dropoff_address' => '456 Oak Ave',
            'total_fare' => 150.00,
        ]);

        $response = $this->postJson("/api/v1/rides/{$ride->id}/cancel");

        $response->assertStatus(200);
        $this->assertDatabaseHas('rides', [
            'id' => $ride->id,
            'status' => 'cancelled',
        ]);
    }

    public function test_driver_can_accept_ride(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');

        $driver = User::factory()->create([
            'is_online' => true,
            'current_latitude' => -23.9468,
            'current_longitude' => 29.4726,
        ]);
        $driver->assignRole('driver');

        $ride = Ride::create([
            'rider_id' => $rider->id,
            'status' => 'searching',
            'category' => 'standard',
            'pickup_latitude' => -23.9500,
            'pickup_longitude' => 29.4800,
            'pickup_address' => '123 Main St',
            'dropoff_latitude' => -23.9600,
            'dropoff_longitude' => 29.4900,
            'dropoff_address' => '456 Oak Ave',
            'total_fare' => 150.00,
        ]);

        Sanctum::actingAs($driver);
        $response = $this->postJson("/api/v1/rides/{$ride->id}/driver-accept");

        $response->assertStatus(200);
        $this->assertDatabaseHas('rides', [
            'id' => $ride->id,
            'status' => 'accepted',
            'driver_id' => $driver->id,
        ]);
    }

    public function test_driver_can_start_ride(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');

        $driver = User::factory()->create();
        $driver->assignRole('driver');

        $ride = Ride::create([
            'rider_id' => $rider->id,
            'driver_id' => $driver->id,
            'status' => 'accepted',
            'category' => 'standard',
            'pickup_latitude' => -23.9468,
            'pickup_longitude' => 29.4726,
            'pickup_address' => '123 Main St',
            'dropoff_latitude' => -23.9500,
            'dropoff_longitude' => 29.4800,
            'dropoff_address' => '456 Oak Ave',
            'total_fare' => 150.00,
        ]);

        Sanctum::actingAs($driver);
        $response = $this->postJson("/api/v1/rides/{$ride->id}/start");

        $response->assertStatus(200);
        $this->assertDatabaseHas('rides', [
            'id' => $ride->id,
            'status' => 'in_progress',
        ]);
    }

    public function test_driver_can_complete_ride(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');

        $driver = User::factory()->create();
        $driver->assignRole('driver');

        $ride = Ride::create([
            'rider_id' => $rider->id,
            'driver_id' => $driver->id,
            'status' => 'in_progress',
            'category' => 'standard',
            'pickup_latitude' => -23.9468,
            'pickup_longitude' => 29.4726,
            'pickup_address' => '123 Main St',
            'dropoff_latitude' => -23.9500,
            'dropoff_longitude' => 29.4800,
            'dropoff_address' => '456 Oak Ave',
            'total_fare' => 150.00,
        ]);

        Sanctum::actingAs($driver);
        $response = $this->postJson("/api/v1/rides/{$ride->id}/complete");

        $response->assertStatus(200);
        $this->assertDatabaseHas('rides', [
            'id' => $ride->id,
            'status' => 'completed',
        ]);
    }

    public function test_rider_can_rate_completed_ride(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');

        $driver = User::factory()->create();
        $driver->assignRole('driver');

        $ride = Ride::create([
            'rider_id' => $rider->id,
            'driver_id' => $driver->id,
            'status' => 'completed',
            'category' => 'standard',
            'pickup_latitude' => -23.9468,
            'pickup_longitude' => 29.4726,
            'pickup_address' => '123 Main St',
            'dropoff_latitude' => -23.9500,
            'dropoff_longitude' => 29.4800,
            'dropoff_address' => '456 Oak Ave',
            'total_fare' => 150.00,
        ]);

        Sanctum::actingAs($rider);
        $response = $this->postJson("/api/v1/rides/{$ride->id}/rate", [
            'rating' => 5,
            'comment' => 'Great ride!',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('ratings', [
            'ride_id' => $ride->id,
            'rater_id' => $rider->id,
            'ratee_id' => $driver->id,
            'rating' => 5,
        ]);
    }

    public function test_unauthenticated_user_cannot_create_ride(): void
    {
        $response = $this->postJson('/api/v1/rides', [
            'pickup_latitude' => -23.9468,
            'pickup_longitude' => 29.4726,
            'pickup_address' => '123 Main St',
            'dropoff_latitude' => -23.9500,
            'dropoff_longitude' => 29.4800,
            'dropoff_address' => '456 Oak Ave',
            'category' => 'standard',
        ]);

        $response->assertStatus(401);
    }

    public function test_rider_can_get_ride_history(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        Sanctum::actingAs($rider);

        Ride::create([
            'rider_id' => $rider->id,
            'status' => 'completed',
            'category' => 'standard',
            'pickup_latitude' => -23.9468,
            'pickup_longitude' => 29.4726,
            'pickup_address' => '123 Main St',
            'dropoff_latitude' => -23.9500,
            'dropoff_longitude' => 29.4800,
            'dropoff_address' => '456 Oak Ave',
            'total_fare' => 150.00,
        ]);

        $response = $this->getJson('/api/v1/rides');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_rider_can_apply_promo_to_ride(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        Sanctum::actingAs($rider);

        $ride = Ride::create([
            'rider_id' => $rider->id,
            'status' => 'searching',
            'category' => 'standard',
            'pickup_latitude' => -23.9468,
            'pickup_longitude' => 29.4726,
            'pickup_address' => '123 Main St',
            'dropoff_latitude' => -23.9500,
            'dropoff_longitude' => 29.4800,
            'dropoff_address' => '456 Oak Ave',
            'total_fare' => 150.00,
        ]);

        $response = $this->postJson("/api/v1/rides/{$ride->id}/apply-promo", [
            'promo_code' => 'WELCOME10',
        ]);

        $response->assertStatus(200);
    }

    public function test_driver_cannot_start_ride_not_assigned(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');

        $driver = User::factory()->create();
        $driver->assignRole('driver');

        $ride = Ride::create([
            'rider_id' => $rider->id,
            'status' => 'accepted',
            'category' => 'standard',
            'pickup_latitude' => -23.9468,
            'pickup_longitude' => 29.4726,
            'pickup_address' => '123 Main St',
            'dropoff_latitude' => -23.9500,
            'dropoff_longitude' => 29.4800,
            'dropoff_address' => '456 Oak Ave',
            'total_fare' => 150.00,
        ]);

        Sanctum::actingAs($driver);
        $response = $this->postJson("/api/v1/rides/{$ride->id}/start");

        $response->assertStatus(403);
    }

    public function test_rider_cannot_complete_ride_not_their_ride(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');

        $driver = User::factory()->create();
        $driver->assignRole('driver');

        $ride = Ride::create([
            'rider_id' => $rider->id,
            'driver_id' => $driver->id,
            'status' => 'in_progress',
            'category' => 'standard',
            'pickup_latitude' => -23.9468,
            'pickup_longitude' => 29.4726,
            'pickup_address' => '123 Main St',
            'dropoff_latitude' => -23.9500,
            'dropoff_longitude' => 29.4800,
            'dropoff_address' => '456 Oak Ave',
            'total_fare' => 150.00,
        ]);

        $otherRider = User::factory()->create();
        $otherRider->assignRole('rider');
        Sanctum::actingAs($otherRider);

        $response = $this->postJson("/api/v1/rides/{$ride->id}/complete");

        $response->assertStatus(403);
    }
}

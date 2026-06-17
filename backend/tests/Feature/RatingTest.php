<?php

namespace Tests\Feature;

use App\Models\Rating;
use App\Models\Ride;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RatingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::create(['name' => 'rider', 'guard_name' => 'web']);
        Role::create(['name' => 'driver', 'guard_name' => 'web']);
    }

    public function test_user_can_get_ratings_received(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');

        $driver = User::factory()->create();
        $driver->assignRole('driver');

        $ride = Ride::create([
            'tenant_id' => $rider->tenant_id,
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
            'completed_at' => now(),
        ]);

        Rating::create([
            'ride_id' => $ride->id,
            'rater_id' => $rider->id,
            'ratee_id' => $driver->id,
            'score' => 5,
            'comment' => 'Great driver!',
        ]);

        Sanctum::actingAs($driver);
        $response = $this->getJson('/api/v1/ratings');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_user_can_get_ratings_given(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');

        $driver = User::factory()->create();
        $driver->assignRole('driver');

        $ride = Ride::create([
            'tenant_id' => $rider->tenant_id,
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
            'completed_at' => now(),
        ]);

        Rating::create([
            'ride_id' => $ride->id,
            'rater_id' => $rider->id,
            'ratee_id' => $driver->id,
            'score' => 4,
        ]);

        Sanctum::actingAs($rider);
        $response = $this->getJson('/api/v1/ratings/given');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_user_can_show_rating(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');

        $driver = User::factory()->create();
        $driver->assignRole('driver');

        $ride = Ride::create([
            'tenant_id' => $rider->tenant_id,
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
            'completed_at' => now(),
        ]);

        $rating = Rating::create([
            'ride_id' => $ride->id,
            'rater_id' => $rider->id,
            'ratee_id' => $driver->id,
            'score' => 5,
        ]);

        Sanctum::actingAs($rider);
        $response = $this->getJson("/api/v1/ratings/{$rating->id}");

        $response->assertStatus(200)
            ->assertJsonPath('score', 5);
    }

    public function test_user_cannot_view_other_users_rating(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');

        $driver = User::factory()->create();
        $driver->assignRole('driver');

        $otherUser = User::factory()->create();
        $otherUser->assignRole('rider');

        $ride = Ride::create([
            'tenant_id' => $rider->tenant_id,
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
            'completed_at' => now(),
        ]);

        $rating = Rating::create([
            'ride_id' => $ride->id,
            'rater_id' => $rider->id,
            'ratee_id' => $driver->id,
            'score' => 3,
        ]);

        Sanctum::actingAs($otherUser);
        $response = $this->getJson("/api/v1/ratings/{$rating->id}");

        $response->assertStatus(403);
    }

    public function test_unauthenticated_cannot_access_ratings(): void
    {
        $response = $this->getJson('/api/v1/ratings');
        $response->assertStatus(401);
    }
}

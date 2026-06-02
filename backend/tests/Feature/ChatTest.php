<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Ride;
use App\Models\RideChatMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ChatTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::create(['name' => 'rider', 'guard_name' => 'web']);
        Role::create(['name' => 'driver', 'guard_name' => 'web']);
    }

    public function test_rider_can_send_message(): void
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

        Sanctum::actingAs($rider);
        $response = $this->postJson("/api/v1/chat/rides/{$ride->id}/messages", [
            'message' => 'Hi, I am at the pickup point',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('ride_chat_messages', [
            'ride_id' => $ride->id,
            'sender_id' => $rider->id,
            'message' => 'Hi, I am at the pickup point',
        ]);
    }

    public function test_rider_can_get_messages(): void
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

        RideChatMessage::create([
            'ride_id' => $ride->id,
            'sender_id' => $rider->id,
            'message' => 'Hello!',
            'read_at' => now(),
        ]);

        Sanctum::actingAs($rider);
        $response = $this->getJson("/api/v1/chat/rides/{$ride->id}/messages");

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_driver_can_send_message(): void
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
        $response = $this->postJson("/api/v1/chat/rides/{$ride->id}/messages", [
            'message' => 'On my way!',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('ride_chat_messages', [
            'ride_id' => $ride->id,
            'sender_id' => $driver->id,
            'message' => 'On my way!',
        ]);
    }

    public function test_rider_can_mark_messages_read(): void
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

        RideChatMessage::create([
            'ride_id' => $ride->id,
            'sender_id' => $driver->id,
            'message' => 'I am here',
            'read_at' => null,
        ]);

        Sanctum::actingAs($rider);
        $response = $this->postJson("/api/v1/chat/rides/{$ride->id}/read");

        $response->assertStatus(200);
    }

    public function test_rider_can_get_unread_count(): void
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

        RideChatMessage::create([
            'ride_id' => $ride->id,
            'sender_id' => $driver->id,
            'message' => 'Unread message',
            'read_at' => null,
        ]);

        Sanctum::actingAs($rider);
        $response = $this->getJson("/api/v1/chat/rides/{$ride->id}/unread");

        $response->assertStatus(200)
            ->assertJsonPath('count', 1);
    }

    public function test_rider_cannot_message_other_ride(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');

        $driver = User::factory()->create();
        $driver->assignRole('driver');

        $otherRider = User::factory()->create();
        $otherRider->assignRole('rider');

        $ride = Ride::create([
            'rider_id' => $otherRider->id,
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

        Sanctum::actingAs($rider);
        $response = $this->postJson("/api/v1/chat/rides/{$ride->id}/messages", [
            'message' => 'Sneaky',
        ]);

        $response->assertStatus(403);
    }

    public function test_unauthenticated_cannot_send_message(): void
    {
        $response = $this->postJson('/api/v1/chat/rides/1/messages', [
            'message' => 'Test',
        ]);

        $response->assertStatus(401);
    }
}

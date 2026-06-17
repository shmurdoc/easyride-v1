<?php

namespace Tests\Feature;

use App\Models\InAppNotification;
use App\Models\PushToken;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::create(['name' => 'rider', 'guard_name' => 'web']);
        Role::create(['name' => 'driver', 'guard_name' => 'web']);
    }

    public function test_rider_can_get_notifications(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');

        InAppNotification::create([
            'user_id' => $rider->id,
            'title' => 'Ride Completed',
            'body' => 'Your ride is complete',
            'type' => 'ride_completed',
        ]);

        Sanctum::actingAs($rider);
        $response = $this->getJson('/api/v1/notifications');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_rider_can_get_unread_count(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');

        InAppNotification::create([
            'user_id' => $rider->id,
            'title' => 'Ride Completed',
            'body' => 'Your ride is complete',
            'type' => 'ride_completed',
            'is_read' => false,
        ]);

        Sanctum::actingAs($rider);
        $response = $this->getJson('/api/v1/notifications/unread-count');

        $response->assertStatus(200)
            ->assertJsonPath('count', 1);
    }

    public function test_rider_can_mark_notification_read(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');

        $notification = InAppNotification::create([
            'user_id' => $rider->id,
            'title' => 'Ride Completed',
            'body' => 'Your ride is complete',
            'type' => 'ride_completed',
            'is_read' => false,
        ]);

        Sanctum::actingAs($rider);
        $response = $this->postJson("/api/v1/notifications/{$notification->id}/read");

        $response->assertStatus(200);
        $notification->refresh();
        $this->assertTrue($notification->is_read);
        $this->assertNotNull($notification->read_at);
    }

    public function test_rider_can_mark_all_read(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');

        InAppNotification::create([
            'user_id' => $rider->id,
            'title' => 'Notification 1',
            'body' => 'Message 1',
            'type' => 'ride_completed',
            'is_read' => false,
        ]);

        InAppNotification::create([
            'user_id' => $rider->id,
            'title' => 'Notification 2',
            'body' => 'Message 2',
            'type' => 'payment_received',
            'is_read' => false,
        ]);

        Sanctum::actingAs($rider);
        $response = $this->postJson('/api/v1/notifications/read-all');

        $response->assertStatus(200);
        $this->assertDatabaseHas('in_app_notifications', [
            'user_id' => $rider->id,
            'is_read' => true,
        ]);
    }

    public function test_rider_can_register_push_token(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        Sanctum::actingAs($rider);

        $response = $this->postJson('/api/v1/notifications/register-token', [
            'token' => 'fcm-token-12345',
            'platform' => 'android',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('push_tokens', [
            'user_id' => $rider->id,
            'token' => 'fcm-token-12345',
            'platform' => 'android',
        ]);
    }

    public function test_rider_can_unregister_push_token(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');

        PushToken::create([
            'user_id' => $rider->id,
            'token' => 'fcm-token-12345',
            'platform' => 'android',
        ]);

        Sanctum::actingAs($rider);
        $response = $this->postJson('/api/v1/notifications/unregister-token', [
            'token' => 'fcm-token-12345',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseMissing('push_tokens', [
            'token' => 'fcm-token-12345',
        ]);
    }

    public function test_rider_only_sees_own_notifications(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');

        $otherRider = User::factory()->create();
        $otherRider->assignRole('rider');

        InAppNotification::create([
            'user_id' => $rider->id,
            'title' => 'My Notification',
            'body' => 'Mine',
            'type' => 'ride_completed',
        ]);

        InAppNotification::create([
            'user_id' => $otherRider->id,
            'title' => 'Other Notification',
            'body' => 'Not mine',
            'type' => 'ride_completed',
        ]);

        Sanctum::actingAs($rider);
        $response = $this->getJson('/api/v1/notifications');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_unauthenticated_cannot_get_notifications(): void
    {
        $response = $this->getJson('/api/v1/notifications');

        $response->assertStatus(401);
    }

    public function test_driver_can_get_notifications(): void
    {
        $driver = User::factory()->create();
        $driver->assignRole('driver');

        InAppNotification::create([
            'user_id' => $driver->id,
            'title' => 'New Ride Request',
            'body' => 'New ride near you',
            'type' => 'ride_request',
        ]);

        Sanctum::actingAs($driver);
        $response = $this->getJson('/api/v1/notifications');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }
}

<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\PushNotificationService;
use App\Services\SmsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Mockery;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class SosTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::create(['name' => 'rider', 'guard_name' => 'web']);
        Role::create(['name' => 'admin', 'guard_name' => 'web']);

        $this->app->instance(PushNotificationService::class, Mockery::mock(PushNotificationService::class, function ($mock) {
            $mock->shouldReceive('sendToDevice')->byDefault();
        }));
        $this->app->instance(SmsService::class, Mockery::mock(SmsService::class, function ($mock) {
            $mock->shouldReceive('sendSosAlert')->byDefault();
        }));
    }

    public function test_user_can_trigger_sos(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        Sanctum::actingAs($rider);

        $response = $this->postJson('/api/v1/sos', [
            'latitude' => -23.9468,
            'longitude' => 29.4726,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['message', 'alert_id', 'cancel_window']);
    }

    public function test_trigger_sos_validates_coordinates(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        Sanctum::actingAs($rider);

        $response = $this->postJson('/api/v1/sos', []);

        $response->assertStatus(422);
    }

    public function test_user_can_cancel_own_sos(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        Sanctum::actingAs($rider);

        $triggerResponse = $this->postJson('/api/v1/sos', [
            'latitude' => -23.9468,
            'longitude' => 29.4726,
        ]);

        $alertId = $triggerResponse->json('alert_id');

        $response = $this->postJson("/api/v1/sos/{$alertId}/cancel");

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_admin_can_view_active_sos(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/v1/sos/active');

        $response->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    public function test_non_admin_cannot_view_active_sos(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        Sanctum::actingAs($rider);

        $response = $this->getJson('/api/v1/sos/active');

        $response->assertStatus(403);
    }

    public function test_unauthenticated_cannot_trigger_sos(): void
    {
        $response = $this->postJson('/api/v1/sos', [
            'latitude' => -23.9468,
            'longitude' => 29.4726,
        ]);

        $response->assertStatus(401);
    }
}

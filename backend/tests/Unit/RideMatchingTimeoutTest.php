<?php

namespace Tests\Unit;

use App\Models\Ride;
use App\Models\Tenant;
use App\Models\User;
use App\Services\RideMatchingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RideMatchingTimeoutTest extends TestCase
{
    use RefreshDatabase;

    private RideMatchingService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new RideMatchingService;
        Role::create(['name' => 'rider', 'guard_name' => 'web']);
    }

    public function test_expire_stale_rides_expires_old_searching_rides(): void
    {
        $tenant = Tenant::factory()->create();
        $rider = User::factory()->create();

        $oldRide = new Ride;
        $oldRide->rider_id = $rider->id;
        $oldRide->tenant_id = $tenant->id;
        $oldRide->status = 'searching';
        $oldRide->category = 'standard';
        $oldRide->pickup_latitude = -23.9500;
        $oldRide->pickup_longitude = 29.4800;
        $oldRide->pickup_address = '123 Main St';
        $oldRide->dropoff_latitude = -23.9600;
        $oldRide->dropoff_longitude = 29.4900;
        $oldRide->dropoff_address = '456 Oak Ave';
        $oldRide->total_fare = 100.00;
        $oldRide->timestamps = false;
        $oldRide->created_at = now()->subMinutes(5);
        $oldRide->save();

        $count = $this->service->expireStaleRides();

        $this->assertEquals(1, $count);
        $this->assertDatabaseHas('rides', [
            'id' => $oldRide->id,
            'status' => 'cancelled',
            'cancelled_by' => 'system',
            'cancellation_reason' => 'no_driver_available',
        ]);
        $this->assertNotNull($oldRide->fresh()->cancelled_at);
    }

    public function test_does_not_expire_recent_rides(): void
    {
        $tenant = Tenant::factory()->create();
        $rider = User::factory()->create();

        $recentRide = new Ride;
        $recentRide->rider_id = $rider->id;
        $recentRide->tenant_id = $tenant->id;
        $recentRide->status = 'searching';
        $recentRide->category = 'standard';
        $recentRide->pickup_latitude = -23.9500;
        $recentRide->pickup_longitude = 29.4800;
        $recentRide->pickup_address = '123 Main St';
        $recentRide->dropoff_latitude = -23.9600;
        $recentRide->dropoff_longitude = 29.4900;
        $recentRide->dropoff_address = '456 Oak Ave';
        $recentRide->total_fare = 100.00;
        $recentRide->timestamps = false;
        $recentRide->created_at = now()->subSeconds(30);
        $recentRide->save();

        $count = $this->service->expireStaleRides();

        $this->assertEquals(0, $count);
        $this->assertDatabaseHas('rides', [
            'id' => $recentRide->id,
            'status' => 'searching',
        ]);
    }

    public function test_cancellation_reason_is_stored_on_user_cancel(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        $tenant = Tenant::factory()->create();

        $ride = Ride::create([
            'rider_id' => $rider->id,
            'tenant_id' => $tenant->id,
            'status' => 'searching',
            'category' => 'standard',
            'pickup_latitude' => -23.9500,
            'pickup_longitude' => 29.4800,
            'pickup_address' => '123 Main St',
            'dropoff_latitude' => -23.9600,
            'dropoff_longitude' => 29.4900,
            'dropoff_address' => '456 Oak Ave',
            'total_fare' => 100.00,
        ]);

        $response = $this->actingAs($rider)->postJson("/api/v1/rides/{$ride->id}/cancel", [
            'cancellation_reason' => 'changed_mind',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('rides', [
            'id' => $ride->id,
            'status' => 'cancelled',
            'cancellation_reason' => 'changed_mind',
            'cancelled_by' => $rider->id,
        ]);
    }
}

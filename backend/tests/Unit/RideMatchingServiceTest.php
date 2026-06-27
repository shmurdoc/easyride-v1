<?php

namespace Tests\Unit;

use App\Models\Tenant;
use App\Models\User;
use App\Models\Vehicle;
use App\Services\RideMatchingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RideMatchingServiceTest extends TestCase
{
    use RefreshDatabase;

    private RideMatchingService $service;

    protected function setUp(): void
    {
        parent::setUp();
        Role::create(['name' => 'driver', 'guard_name' => 'web']);
        $this->service = app(RideMatchingService::class);
    }

    public function test_finds_nearest_driver(): void
    {
        $tenant = Tenant::factory()->create();
        $driver = User::factory()->create([
            'tenant_id' => $tenant->id,
            'is_online' => true,
            'current_latitude' => -23.9470,
            'current_longitude' => 29.4730,
        ]);
        $driver->assignRole('driver');

        Vehicle::create([
            'user_id' => $driver->id,
            'make' => 'Toyota',
            'model' => 'Corolla',
            'year' => 2023,
            'license_plate' => 'ABC123',
            'category' => 'standard',
            'is_active' => true,
        ]);

        $results = $this->service->findNearbyDrivers(-23.9468, 29.4726, 'standard', 5.0);

        $this->assertNotEmpty($results);
        $this->assertEquals($driver->id, $results->first()->id);
    }

    public function test_returns_null_when_no_drivers_available(): void
    {
        $results = $this->service->findNearbyDrivers(-23.9468, 29.4726, 'standard', 5.0);

        $this->assertEmpty($results);
    }

    public function test_matches_driver_within_radius(): void
    {
        $tenant = Tenant::factory()->create();

        $nearDriver = User::factory()->create([
            'tenant_id' => $tenant->id,
            'is_online' => true,
            'current_latitude' => -23.9300,
            'current_longitude' => 29.4800,
        ]);
        $nearDriver->assignRole('driver');
        Vehicle::create([
            'user_id' => $nearDriver->id,
            'make' => 'Toyota',
            'model' => 'Corolla',
            'year' => 2023,
            'license_plate' => 'ABC123',
            'category' => 'standard',
            'is_active' => true,
        ]);

        $farDriver = User::factory()->create([
            'tenant_id' => $tenant->id,
            'is_online' => true,
            'current_latitude' => -25.0000,
            'current_longitude' => 30.0000,
        ]);
        $farDriver->assignRole('driver');
        Vehicle::create([
            'user_id' => $farDriver->id,
            'make' => 'Honda',
            'model' => 'Civic',
            'year' => 2023,
            'license_plate' => 'XYZ789',
            'category' => 'standard',
            'is_active' => true,
        ]);

        $results = $this->service->findNearbyDrivers(-23.9468, 29.4726, 'standard', 5.0);

        $this->assertCount(1, $results);
        $this->assertEquals($nearDriver->id, $results->first()->id);
    }

    public function test_calculates_distance_between_points(): void
    {
        $distance = $this->service->calculateDistance(-23.9468, 29.4726, -23.9500, 29.4800);
        $this->assertGreaterThan(0, $distance);
    }
}

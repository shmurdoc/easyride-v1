<?php

namespace Tests\Unit;

use App\Services\RideMatchingService;
use Tests\TestCase;

class RideMatchingServiceTest extends TestCase
{
    public function test_finds_nearest_driver(): void
    {
        $this->markTestIncomplete('Requires Redis geo-index mock');
    }

    public function test_returns_null_when_no_drivers_available(): void
    {
        $this->markTestIncomplete('Requires empty drivers scenario');
    }

    public function test_matches_driver_within_radius(): void
    {
        $this->markTestIncomplete('Requires radius configuration');
    }

    public function test_calculates_distance_between_points(): void
    {
        $service = app(RideMatchingService::class);
        $distance = $service->calculateDistance(-23.9468, 29.4726, -23.9500, 29.4800);
        $this->assertGreaterThan(0, $distance);
    }
}

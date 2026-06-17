<?php

namespace Tests\Unit;

use App\Models\User;
use App\Services\RatingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RatingServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_service_resolves_from_container(): void
    {
        $service = app(RatingService::class);
        $this->assertNotNull($service);
    }

    public function test_get_driver_rating_returns_zero_for_new_driver(): void
    {
        $service = app(RatingService::class);
        $driver = User::factory()->create(['role' => 'driver']);
        $rating = $service->getDriverRating($driver);
        $this->assertEquals(0.0, $rating);
    }

    public function test_get_rider_rating_returns_zero_for_new_rider(): void
    {
        $service = app(RatingService::class);
        $rider = User::factory()->create(['role' => 'rider']);
        $rating = $service->getRiderRating($rider);
        $this->assertEquals(0.0, $rating);
    }
}

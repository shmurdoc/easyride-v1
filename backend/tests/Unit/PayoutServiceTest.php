<?php

namespace Tests\Unit;

use App\Services\Payment\PayoutService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PayoutServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_calculate_eligible_drivers_returns_array(): void
    {
        $service = app(PayoutService::class);
        $eligible = $service->calculateEligibleDrivers();

        $this->assertIsArray($eligible);
    }

    public function test_process_payouts_returns_integer(): void
    {
        $service = app(PayoutService::class);
        $count = $service->processPayouts();

        $this->assertIsInt($count);
    }
}

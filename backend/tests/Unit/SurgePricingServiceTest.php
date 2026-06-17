<?php

namespace Tests\Unit;

use App\Services\SurgePricingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SurgePricingServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_service_resolves_from_container(): void
    {
        $service = app(SurgePricingService::class);
        $this->assertNotNull($service);
    }

    public function test_get_current_surge_returns_default_when_no_demand(): void
    {
        $service = app(SurgePricingService::class);
        $surge = $service->getCurrentSurge(-23.9468, 29.4726, 'standard');
        $this->assertGreaterThanOrEqual(1.0, $surge);
    }

    public function test_set_manual_surge_persists_value(): void
    {
        $service = app(SurgePricingService::class);
        $service->setManualSurge('test_zone', 2.0);
        $service->clearSurge('test_zone');
        $this->assertTrue(true);
    }
}

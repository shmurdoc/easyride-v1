<?php

namespace Tests\Unit\Jobs;

use App\Jobs\MatchDriversJob;
use App\Models\Ride;
use App\Models\Tenant;
use App\Models\User;
use App\Services\RideMatchingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class MatchDriversJobTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::create(['name' => 'driver', 'guard_name' => 'web']);
    }

    public function test_job_dispatches_correctly(): void
    {
        Bus::fake();

        $tenant = Tenant::factory()->create();
        $rider = User::factory()->create(['tenant_id' => $tenant->id]);
        $ride = Ride::factory()->create([
            'rider_id' => $rider->id,
            'tenant_id' => $tenant->id,
            'pickup_latitude' => -23.9468,
            'pickup_longitude' => 29.4726,
            'category' => 'standard',
        ]);

        MatchDriversJob::dispatch($ride);

        Bus::assertDispatched(MatchDriversJob::class);
    }

    public function test_handle_calls_find_nearby_drivers(): void
    {
        $tenant = Tenant::factory()->create();
        $rider = User::factory()->create(['tenant_id' => $tenant->id]);
        $ride = Ride::factory()->create([
            'rider_id' => $rider->id,
            'tenant_id' => $tenant->id,
            'pickup_latitude' => -23.9468,
            'pickup_longitude' => 29.4726,
            'category' => 'standard',
        ]);

        $service = $this->createMock(RideMatchingService::class);
        $service->expects($this->once())
            ->method('findNearbyDrivers')
            ->with(
                (float) -23.9468,
                (float) 29.4726,
                'standard',
            );

        $job = new MatchDriversJob($ride);
        $job->handle($service);
    }
}

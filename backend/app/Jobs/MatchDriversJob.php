<?php

namespace App\Jobs;

use App\Models\Ride;
use App\Services\RideMatchingService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class MatchDriversJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, SerializesModels;

    public function __construct(
        protected Ride $ride
    ) {}

    public function handle(RideMatchingService $rideMatchingService): void
    {
        $rideMatchingService->findNearbyDrivers(
            (float) $this->ride->pickup_latitude,
            (float) $this->ride->pickup_longitude,
            $this->ride->category,
        );
    }
}

<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\RideMatchingService;
use Illuminate\Console\Command;

class ExpireStaleRides extends Command
{
    protected $signature = 'rides:expire-stale';

    protected $description = 'Expire ride requests that have been searching for more than 60 seconds';

    public function handle(RideMatchingService $rideMatchingService): int
    {
        $count = $rideMatchingService->expireStaleRides();

        $this->info("Expired {$count} stale ride(s).");

        return self::SUCCESS;
    }
}

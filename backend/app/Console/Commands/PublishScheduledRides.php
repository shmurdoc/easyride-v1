<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Events\NewRideRequest;
use App\Models\Ride;
use App\Models\ScheduledRide;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Event;

class PublishScheduledRides extends Command
{
    protected $signature = 'scheduled-rides:publish';

    protected $description = 'Publish scheduled rides that are due within 10 minutes';

    public function handle(): int
    {
        $due = ScheduledRide::where('status', 'pending')
            ->where('scheduled_at', '<=', now()->addMinutes(10))
            ->get();

        $count = 0;

        foreach ($due as $scheduled) {
            $ride = Ride::create([
                'tenant_id' => $scheduled->tenant_id,
                'rider_id' => $scheduled->rider_id,
                'pickup_latitude' => $scheduled->pickup_latitude,
                'pickup_longitude' => $scheduled->pickup_longitude,
                'dropoff_latitude' => $scheduled->dropoff_latitude,
                'dropoff_longitude' => $scheduled->dropoff_longitude,
                'pickup_address' => $scheduled->pickup_address,
                'dropoff_address' => $scheduled->dropoff_address,
                'category' => $scheduled->category,
                'status' => 'searching',
                'distance_km' => $scheduled->distance_km,
                'duration_minutes' => $scheduled->duration_minutes,
                'base_fare' => $scheduled->base_fare,
                'per_km_fare' => $scheduled->per_km_fare,
                'surge_multiplier' => $scheduled->surge_multiplier,
                'total_fare' => $scheduled->total_fare,
            ]);

            $scheduled->update(['status' => 'published']);

            Event::dispatch(new NewRideRequest($ride));

            $count++;
        }

        $this->info("Published {$count} scheduled ride(s).");

        return Command::SUCCESS;
    }
}

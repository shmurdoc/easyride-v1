<?php

namespace App\Broadcasting\Channels;

use App\Models\Ride;
use App\Models\User;

class RideChannel
{
    public function join(User $user, string $rideId): bool
    {
        $ride = Ride::find($rideId);

        if ($ride === null) {
            return false;
        }

        if ($user->hasRole('admin')) {
            return true;
        }

        if ($ride->rider_id === $user->id) {
            return true;
        }

        if ($ride->driver_id === $user->id) {
            return true;
        }

        return false;
    }
}

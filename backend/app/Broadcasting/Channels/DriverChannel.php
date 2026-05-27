<?php

namespace App\Broadcasting\Channels;

use App\Models\User;

class DriverChannel
{
    public function join(User $user, string $driverId): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->id === $driverId;
    }
}

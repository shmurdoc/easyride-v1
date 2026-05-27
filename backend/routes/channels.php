<?php

use Illuminate\Support\Facades\Broadcast;
use App\Broadcasting\Channels\RideChannel;
use App\Broadcasting\Channels\DriverChannel;

Broadcast::channel('rides.{rideId}', RideChannel::class);
Broadcast::channel('drivers.{driverId}', DriverChannel::class);
Broadcast::channel('drivers.{driverId}.tracking', DriverChannel::class);
Broadcast::channel('riders.{riderId}', function ($user, $riderId) {
    return (string) $user->id === (string) $riderId || $user->hasRole('admin');
});
Broadcast::channel('deliveries.{deliveryId}', function ($user, $deliveryId) {
    return true;
});
Broadcast::channel('admin', function ($user) {
    return $user->hasRole('admin');
});

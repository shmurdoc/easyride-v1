<?php

namespace App\Providers;

use App\Events\DriverArrived;
use App\Events\PaymentSucceeded;
use App\Events\RideAccepted;
use App\Events\RideCancelled;
use App\Events\RideCompleted;
use App\Events\RideStarted;
use App\Events\SosTriggered;
use App\Listeners\SendPushNotification;
use App\Listeners\SendSosAlerts;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        RideAccepted::class => [SendPushNotification::class.'@handleRideAccepted'],
        DriverArrived::class => [SendPushNotification::class.'@handleDriverArrived'],
        RideStarted::class => [SendPushNotification::class.'@handleRideStarted'],
        RideCompleted::class => [SendPushNotification::class.'@handleRideCompleted'],
        RideCancelled::class => [SendPushNotification::class.'@handleRideCancelled'],
        PaymentSucceeded::class => [SendPushNotification::class.'@handlePaymentSucceeded'],
        SosTriggered::class => [SendSosAlerts::class.'@handle'],
    ];

    public function boot(): void
    {
        parent::boot();
    }
}

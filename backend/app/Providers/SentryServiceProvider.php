<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Sentry\Laravel\Integration;

class SentryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        if (config('sentry.dsn')) {
            Integration::handlesExceptions();
            Integration::handlesEvents();
            Integration::handlesLogs();
        }
    }
}

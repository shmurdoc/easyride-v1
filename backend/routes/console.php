<?php

use App\Models\WalletTransaction;
use Illuminate\Support\Facades\Schedule;

Schedule::command('payments:process --type=escrow')->everyMinute();
Schedule::command('payments:process --type=payouts')->everyMinute();
Schedule::command('payments:process --type=reconciliation')->hourly();

Schedule::command('rides:expire-stale')->everyThirtySeconds();

Schedule::command('scheduled-rides:publish')->everyMinute();

Schedule::command('model:prune', ['--model' => [WalletTransaction::class]])->daily();

Schedule::command('escrow:release')->daily();
Schedule::command('payouts:process --type=daily')->dailyAt('06:00');
Schedule::command('payouts:process --type=weekly')->weeklyOn(1, '06:00');

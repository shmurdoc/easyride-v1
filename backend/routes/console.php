<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('payments:process --type=escrow')->everyMinute();
Schedule::command('payments:process --type=payouts')->everyMinute();
Schedule::command('payments:process --type=reconciliation')->hourly();

Schedule::command('model:prune', ['--model' => [\App\Models\WalletTransaction::class]])->daily();

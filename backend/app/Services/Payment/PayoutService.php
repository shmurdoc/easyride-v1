<?php

namespace App\Services\Payment;

use App\Jobs\ProcessPayoutJob;
use App\Models\DriverPayout;
use App\Models\Wallet;

class PayoutService
{
    public function calculateEligibleDrivers(): array
    {
        return Wallet::where('balance', '>', 0)
            ->whereHas('user', fn ($q) => $q->whereHas('driverProfile'))
            ->get()
            ->toArray();
    }

    public function processPayouts(): int
    {
        $count = 0;
        $wallets = Wallet::where('balance', '>', 0)
            ->whereHas('user', fn ($q) => $q->whereHas('driverProfile'))
            ->cursor();

        foreach ($wallets as $wallet) {
            $amount = $wallet->balance;
            if ($amount <= 0) {
                continue;
            }

            $payout = DriverPayout::create([
                'driver_id' => $wallet->user_id,
                'amount' => $amount,
                'method' => 'wallet',
                'status' => 'pending',
            ]);

            ProcessPayoutJob::dispatch($payout);
            $count++;
        }

        return $count;
    }

    public function processDailyPayouts(): int
    {
        $count = 0;
        Wallet::where('balance', '>', 200)
            ->whereHas('user', fn ($q) => $q->whereHas('driverProfile'))
            ->each(function (Wallet $wallet) use (&$count) {
                $payout = DriverPayout::create([
                    'driver_id' => $wallet->user_id,
                    'amount' => $wallet->balance,
                    'method' => 'wallet',
                    'status' => 'pending',
                ]);
                ProcessPayoutJob::dispatch($payout);
                $count++;
            });

        return $count;
    }

    public function processWeeklyPayouts(): int
    {
        $count = 0;
        Wallet::whereBetween('balance', [0.01, 200])
            ->whereHas('user', fn ($q) => $q->whereHas('driverProfile'))
            ->each(function (Wallet $wallet) use (&$count) {
                $payout = DriverPayout::create([
                    'driver_id' => $wallet->user_id,
                    'amount' => $wallet->balance,
                    'method' => 'wallet',
                    'status' => 'pending',
                ]);
                ProcessPayoutJob::dispatch($payout);
                $count++;
            });

        return $count;
    }
}

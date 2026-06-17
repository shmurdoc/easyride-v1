<?php

namespace App\Services\Payment;

use App\Models\CashReconciliation;
use App\Models\Ride;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;

class CashReconciliationService
{
    public function markCashPaid(Ride $ride): CashReconciliation
    {
        $feePercentage = config('services.platform.fee_percentage', 15);
        $platformFee = round($ride->total_fare * ($feePercentage / 100), 2);
        $driverEarns = $ride->total_fare - $platformFee;

        return DB::transaction(function () use ($ride, $platformFee, $driverEarns) {
            $reconciliation = CashReconciliation::create([
                'ride_id' => $ride->id,
                'driver_id' => $ride->driver_id,
                'rider_id' => $ride->rider_id,
                'fare_amount' => $ride->total_fare,
                'platform_fee' => $platformFee,
                'driver_earns' => $driverEarns,
                'driver_marked_at' => now(),
                'status' => 'pending',
            ]);

            Wallet::where('user_id', $ride->driver_id)
                ->decrement('balance', $platformFee);

            return $reconciliation;
        });
    }

    public function reconcileByDriver(string $driverId, string $date): array
    {
        return CashReconciliation::where('driver_id', $driverId)
            ->whereDate('driver_marked_at', $date)
            ->get()
            ->toArray();
    }
}

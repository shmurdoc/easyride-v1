<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SettlementService
{
    private const DAILY_THRESHOLD = 200.00;

    private const MIN_PAYOUT = 50.00;

    public function __construct(
        private readonly WalletService $walletService,
    ) {}

    public function processDriverPayouts(): array
    {
        $processed = 0;
        $total = 0.0;
        $errors = 0;

        $drivers = User::role('driver')
            ->whereHas('wallet', function ($q) {
                $q->where('balance', '>=', self::MIN_PAYOUT);
            })
            ->cursor();

        foreach ($drivers as $driver) {
            try {
                $result = $this->processSinglePayout($driver);
                if ($result['success']) {
                    $processed++;
                    $total += $result['amount'];
                }
            } catch (\Exception $e) {
                Log::error('Driver payout failed', [
                    'driver_id' => $driver->id,
                    'error' => $e->getMessage(),
                ]);
                $errors++;
            }
        }

        Log::info('Driver payout batch completed', [
            'processed' => $processed,
            'total' => round($total, 2),
            'errors' => $errors,
        ]);

        return ['processed' => $processed, 'total' => round($total, 2), 'errors' => $errors];
    }

    public function processSinglePayout(User $driver): array
    {
        $wallet = $this->walletService->getOrCreateWallet($driver);
        $balance = (float) $wallet->balance;

        if ($balance < self::MIN_PAYOUT) {
            return ['success' => false, 'reason' => 'Below minimum payout threshold.'];
        }

        return DB::transaction(function () use ($wallet, $driver, $balance) {
            $payoutAmount = $balance;

            if ($balance > self::DAILY_THRESHOLD) {
                $payoutAmount = $balance;
            }

            $payoutAmount = round($payoutAmount, 2);

            $this->walletService->debit(
                $wallet,
                $payoutAmount,
                'payout',
                $driver->id,
                "Driver payout of R{$payoutAmount}",
            );

            DB::table('driver_payouts')->insert([
                'id' => (string) Str::uuid(),
                'driver_id' => $driver->id,
                'amount' => $payoutAmount,
                'balance_before' => $balance,
                'balance_after' => 0.0,
                'status' => 'pending',
                'payout_method' => 'bank_transfer',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return [
                'success' => true,
                'amount' => $payoutAmount,
                'driver_id' => $driver->id,
            ];
        });
    }

    public function getSettlementHistory(User $driver, int $limit = 20): array
    {
        return DB::table('driver_payouts')
            ->where('driver_id', $driver->id)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    public function getPendingPayouts(): array
    {
        return DB::table('driver_payouts')
            ->where('status', 'pending')
            ->orderBy('created_at', 'asc')
            ->get()
            ->toArray();
    }

    public function markPayoutComplete(string $payoutId, string $reference = ''): bool
    {
        return DB::table('driver_payouts')
            ->where('id', $payoutId)
            ->update([
                'status' => 'completed',
                'completed_at' => now(),
                'gateway_reference' => $reference,
                'updated_at' => now(),
            ]) > 0;
    }

    public function markPayoutFailed(string $payoutId, string $reason = ''): bool
    {
        $payout = DB::table('driver_payouts')->where('id', $payoutId)->first();
        if (! $payout) {
            return false;
        }

        DB::table('driver_payouts')
            ->where('id', $payoutId)
            ->update([
                'status' => 'failed',
                'failure_reason' => $reason,
                'updated_at' => now(),
            ]);

        if ($payout->driver_id) {
            $driver = User::find($payout->driver_id);
            if ($driver) {
                $wallet = $this->walletService->getOrCreateWallet($driver);
                $this->walletService->credit(
                    $wallet,
                    (float) $payout->amount,
                    'payout_reversal',
                    $payoutId,
                    "Reversal of failed payout #{$payoutId}",
                );
            }
        }

        return true;
    }

    public function canProcessPayout(User $driver): bool
    {
        $wallet = $this->walletService->getOrCreateWallet($driver);

        return (float) $wallet->balance >= self::MIN_PAYOUT;
    }
}

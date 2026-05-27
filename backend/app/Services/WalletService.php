<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;

class WalletService
{
    public function getOrCreateWallet(User $user, string $currency = 'ZAR'): Wallet
    {
        return Wallet::firstOrCreate(
            ['user_id' => $user->id],
            ['balance' => 0.0, 'pending_balance' => 0.0, 'currency' => $currency],
        );
    }

    public function credit(
        Wallet $wallet,
        float $amount,
        string $referenceType,
        string $referenceId,
        string $description = '',
    ): WalletTransaction {
        return DB::transaction(function () use ($wallet, $amount, $referenceType, $referenceId, $description) {
            $balanceBefore = (float) $wallet->balance;

            $wallet->increment('balance', $amount);

            return $wallet->transactions()->create([
                'type' => 'credit',
                'amount' => $amount,
                'balance_before' => $balanceBefore,
                'balance_after' => (float) $wallet->fresh()->balance,
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
                'description' => $description,
            ]);
        });
    }

    public function debit(
        Wallet $wallet,
        float $amount,
        string $referenceType,
        string $referenceId,
        string $description = '',
    ): WalletTransaction {
        return DB::transaction(function () use ($wallet, $amount, $referenceType, $referenceId, $description) {
            $balanceBefore = (float) $wallet->balance;

            $wallet->decrement('balance', $amount);

            return $wallet->transactions()->create([
                'type' => 'debit',
                'amount' => $amount,
                'balance_before' => $balanceBefore,
                'balance_after' => (float) $wallet->fresh()->balance,
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
                'description' => $description,
            ]);
        });
    }

    public function getBalance(Wallet $wallet): float
    {
        return (float) $wallet->balance;
    }

    public function hasSufficientFunds(Wallet $wallet, float $amount): bool
    {
        return (float) $wallet->balance >= $amount;
    }
}

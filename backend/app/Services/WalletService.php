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
            ['tenant_id' => $user->tenant_id, 'balance' => 0.0, 'pending_balance' => 0.0, 'currency' => $currency],
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
            $freshWallet = Wallet::where('id', $wallet->id)->lockForUpdate()->first();

            if ((float) $freshWallet->balance < $amount) {
                throw new \RuntimeException('Insufficient wallet balance.');
            }

            $balanceBefore = (float) $freshWallet->balance;

            $freshWallet->decrement('balance', $amount);

            return $freshWallet->transactions()->create([
                'type' => 'debit',
                'amount' => $amount,
                'balance_before' => $balanceBefore,
                'balance_after' => (float) $freshWallet->fresh()->balance,
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

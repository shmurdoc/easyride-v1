<?php

namespace App\Services\Payment;

use App\Jobs\ReleaseEscrowJob;
use App\Models\Payment;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;

class EscrowService
{
    public function holdPayment(Payment $payment): void
    {
        $payment->update([
            'status' => 'held',
            'held_until' => now()->addHours(24),
        ]);
    }

    public function releasePayment(Payment $payment): void
    {
        DB::transaction(function () use ($payment) {
            $wallet = Wallet::where('user_id', $payment->payee_id)->firstOrFail();
            $wallet->increment('balance', $payment->driver_payout ?? 0);
            $payment->update(['status' => 'released']);
        });
    }

    public function disputePayment(Payment $payment, string $reason): void
    {
        $payment->update([
            'status' => 'disputed',
            'dispute_hold' => true,
        ]);
    }

    public function resolveDispute(Payment $payment, string $decision, ?string $adminNotes = null): void
    {
        if ($decision === 'release') {
            $this->releasePayment($payment);
        } elseif ($decision === 'refund') {
            $payment->update(['status' => 'refunded']);
        }
    }

    public function releaseEligiblePayments(): int
    {
        $count = 0;
        Payment::where('status', 'held')
            ->where('held_until', '<=', now())
            ->chunk(50, function ($payments) use (&$count) {
                foreach ($payments as $payment) {
                    ReleaseEscrowJob::dispatch($payment);
                    $count++;
                }
            });

        return $count;
    }
}

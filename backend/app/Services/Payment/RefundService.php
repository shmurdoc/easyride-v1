<?php

namespace App\Services\Payment;

use App\Models\Payment;
use App\Models\RefundRequest;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;

class RefundService
{
    public function requestRefund(Payment $payment, string $reason): RefundRequest
    {
        return RefundRequest::create([
            'payment_id' => $payment->id,
            'rider_id' => $payment->payer_id,
            'amount' => $payment->amount,
            'reason' => $reason,
            'status' => 'pending',
        ]);
    }

    public function approveRefund(RefundRequest $refundRequest, string $adminId, float $amount, string $notes = ''): void
    {
        $payment = $refundRequest->payment;
        $gateway = $payment->gateway;

        try {
            if ($gateway === 'stripe' && $payment->gateway_reference) {
                app(StripeService::class)->refund($payment->gateway_reference, (int) round($amount * 100));
            } elseif ($gateway === 'wallet') {
                DB::transaction(function () use ($payment, $amount) {
                    Wallet::where('user_id', $payment->payer_id)->increment('balance', $amount);
                });
            }

            $refundRequest->update([
                'status' => 'processed',
                'admin_id' => $adminId,
                'admin_notes' => $notes,
                'processed_at' => now(),
            ]);

            $payment->update(['status' => 'refunded']);
        } catch (\Exception $e) {
            $refundRequest->update(['status' => 'failed', 'admin_notes' => $e->getMessage()]);
            throw $e;
        }
    }

    public function rejectRefund(RefundRequest $refundRequest, string $adminId, string $reason): void
    {
        $refundRequest->update([
            'status' => 'rejected',
            'admin_id' => $adminId,
            'admin_notes' => $reason,
        ]);
    }
}

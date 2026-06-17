<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Payment;
use App\Models\Ride;
use Illuminate\Support\Facades\DB;

class RefundService
{
    private const FULL_REFUND_WINDOW_MINUTES = 2;

    private const BOOKING_FEE = 15.00;

    public function __construct(
        private readonly PaymentService $paymentService,
        private readonly WalletService $walletService,
    ) {}

    public function processRefund(Ride $ride, string $reason, ?string $adminId = null): array
    {
        $payment = $ride->payment;

        if (! $payment) {
            return ['success' => false, 'error' => 'No payment found for this ride.'];
        }

        if ($payment->status === Payment::STATUS_REFUNDED) {
            return ['success' => false, 'error' => 'Payment already refunded.'];
        }

        $refundAmount = $this->calculateRefundAmount($ride, $reason);

        return DB::transaction(function () use ($payment, $ride, $refundAmount, $reason, $adminId) {
            $payment->update([
                'status' => Payment::STATUS_REFUNDED,
                'refunded_at' => now(),
                'refund_reason' => $reason,
                'refund_amount' => $refundAmount,
                'refunded_by' => $adminId,
            ]);

            if ($refundAmount > 0) {
                $wallet = $this->walletService->getOrCreateWallet($ride->rider);

                $this->walletService->credit(
                    $wallet,
                    $refundAmount,
                    'refund',
                    $ride->id,
                    "Refund for ride {$ride->id}: {$reason}",
                );
            }

            return [
                'success' => true,
                'refund_amount' => $refundAmount,
                'original_amount' => (float) $payment->amount,
                'reason' => $reason,
            ];
        });
    }

    public function calculateRefundAmount(Ride $ride, string $reason): float
    {
        $payment = $ride->payment;
        $amount = (float) ($payment->amount ?? $ride->total_fare ?? 0);

        if ($amount <= 0) {
            return 0;
        }

        if ($reason === 'admin_override' || $reason === 'driver_no_show') {
            return $amount;
        }

        if ($reason === 'rider_cancelled_within_window') {
            return $amount;
        }

        if ($reason === 'rider_cancelled_after_window') {
            return round(max(0, $amount - self::BOOKING_FEE), 2);
        }

        if ($reason === 'duplicate_charge') {
            return $amount;
        }

        if ($reason === 'technical_issue') {
            return min($amount, 25.00);
        }

        return round($amount * 0.5, 2);
    }

    public function isWithinFullRefundWindow(Ride $ride): bool
    {
        if (! $ride->started_at) {
            return false;
        }

        return $ride->started_at->diffInMinutes(now()) <= self::FULL_REFUND_WINDOW_MINUTES;
    }

    public function processDriverNoShowRefund(Ride $ride): array
    {
        if (! $ride->driver) {
            return ['success' => false, 'error' => 'No driver assigned.'];
        }

        return DB::transaction(function () use ($ride) {
            $payment = $ride->payment;
            if (! $payment) {
                return ['success' => false, 'error' => 'No payment.'];
            }

            $this->paymentService->creditDriver($ride);

            return $this->processRefund($ride, 'driver_no_show');
        });
    }
}

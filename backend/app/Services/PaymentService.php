<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Payment;
use App\Models\Ride;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    public function __construct(
        private readonly WalletService $walletService,
    ) {}

    public function processPayment(Ride $ride, string $method = 'wallet', array $gatewayData = []): Payment
    {
        return DB::transaction(function () use ($ride, $method, $gatewayData) {
            $platformFee = $this->calculatePlatformFee((float) $ride->total_fare);

            $payment = Payment::create([
                'ride_id' => $ride->id,
                'payer_id' => $ride->rider_id,
                'method' => $method,
                'gateway' => $method === 'wallet' ? 'wallet' : ($gatewayData['gateway'] ?? 'stub'),
                'gateway_reference' => $gatewayData['reference'] ?? null,
                'amount' => $ride->total_fare,
                'platform_fee' => $platformFee,
                'status' => Payment::STATUS_COMPLETED,
                'paid_at' => now(),
                'gateway_response' => $gatewayData,
            ]);

            if ($method === 'wallet') {
                $this->walletService->debit(
                    $this->walletService->getOrCreateWallet($ride->rider),
                    (float) $ride->total_fare,
                    'payment',
                    $ride->id,
                    "Payment for ride {$ride->id}",
                );
            }

            return $payment;
        });
    }

    public function processRidePayment(Ride $ride): Payment
    {
        return $this->processPayment($ride, 'wallet');
    }

    public function processRefund(Payment $payment, string $reason = ''): Payment
    {
        return DB::transaction(function () use ($payment, $reason) {
            $payment->update([
                'status' => Payment::STATUS_REFUNDED,
                'refunded_at' => now(),
                'refund_reason' => $reason,
            ]);

            $rider = $payment->payer;

            $this->walletService->credit(
                $this->walletService->getOrCreateWallet($rider),
                (float) $payment->amount,
                'refund',
                $payment->ride_id,
                "Refund for payment {$payment->id}: {$reason}",
            );

            return $payment->fresh();
        });
    }

    public function calculatePlatformFee(float $amount): float
    {
        return round($amount * 0.15, 2);
    }

    public function creditDriver(Ride $ride): WalletTransaction
    {
        $amount = (float) $ride->total_fare;
        $platformFee = $this->calculatePlatformFee($amount);
        $netAmount = $amount - $platformFee;

        $wallet = $this->walletService->getOrCreateWallet($ride->driver);

        return $this->walletService->credit(
            $wallet,
            $netAmount,
            'ride_earnings',
            $ride->id,
            "Earnings for ride {$ride->id} (net after fee)",
        );
    }

    public function debitRider(Ride $ride): WalletTransaction
    {
        $wallet = $this->walletService->getOrCreateWallet($ride->rider);

        return $this->walletService->debit(
            $wallet,
            (float) $ride->total_fare,
            'ride_charge',
            $ride->id,
            "Charge for ride {$ride->id}",
        );
    }
}

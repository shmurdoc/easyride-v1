<?php

namespace App\Jobs;

use App\Models\Payment;
use App\Models\Ride;
use App\Services\PaymentService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessPaymentJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, SerializesModels;

    public $queue = 'horizon';

    public function __construct(
        protected Ride $ride,
        protected Payment $payment
    ) {}

    public function handle(PaymentService $paymentService): void
    {
        $paymentService->processPayment($this->ride, $this->payment);
    }
}

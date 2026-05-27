<?php

namespace App\Notifications;

use App\Models\Ride;
use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class PaymentReceived extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected Ride $ride,
        protected Payment $payment,
        protected string $type = 'rider'
    )
    {
        $this->onQueue('horizon');
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'ride_id' => $this->ride->id,
            'payment_id' => $this->payment->id,
            'amount' => $this->payment->amount,
            'status' => $this->payment->status,
            'payment_method' => $this->payment->payment_method,
            'type' => $this->type,
            'message' => $this->type === 'rider'
                ? 'Payment of ' . number_format($this->payment->amount, 2) . ' received for ride ' . $this->ride->id
                : 'Payment of ' . number_format($this->payment->amount, 2) . ' credited for ride ' . $this->ride->id,
        ];
    }
}

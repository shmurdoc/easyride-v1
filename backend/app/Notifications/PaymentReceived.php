<?php

namespace App\Notifications;

use App\Models\Payment;
use App\Models\Ride;
use App\Services\EmailService;
use App\Services\PushNotificationService;
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
    ) {
        $this->onQueue('horizon');
    }

    public function via(object $notifiable): array
    {
        return ['database', 'fcm', 'email'];
    }

    public function toFcm(object $notifiable): mixed
    {
        $title = $this->type === 'rider' ? 'Payment Processed' : 'Payment Received';
        $body = $this->type === 'rider'
            ? 'R'.number_format($this->payment->amount, 2).' paid for your ride'
            : 'R'.number_format($this->payment->amount, 2).' earned from ride';

        return [
            'title' => $title,
            'body' => $body,
        ];
    }

    public function sendEmailNotification(object $notifiable): void
    {
        $emailService = app(EmailService::class);
        $emailService->sendPaymentReceipt(
            $notifiable->email,
            $notifiable->name,
            $this->ride->id,
            number_format($this->payment->amount, 2),
            $this->payment->method,
        );
    }

    public function sendFcmNotification(object $notifiable): void
    {
        $pushService = app(PushNotificationService::class);
        $title = $this->type === 'rider' ? 'Payment Processed' : 'Payment Received';
        $body = $this->type === 'rider'
            ? 'R'.number_format($this->payment->amount, 2).' paid for your ride'
            : 'R'.number_format($this->payment->amount, 2).' earned from ride';

        $pushService->sendToDevice($notifiable, [
            'title' => $title,
            'body' => $body,
            'channel' => 'easyryde_payments',
        ], [
            'type' => 'payment',
            'payment_id' => $this->payment->id,
            'ride_id' => $this->ride->id,
        ]);
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'ride_id' => $this->ride->id,
            'payment_id' => $this->payment->id,
            'amount' => $this->payment->amount,
            'status' => $this->payment->status,
            'payment_method' => $this->payment->method,
            'type' => $this->type,
            'message' => $this->type === 'rider'
                ? 'Payment of R'.number_format($this->payment->amount, 2).' processed'
                : 'Payment of R'.number_format($this->payment->amount, 2).' credited',
        ];
    }
}

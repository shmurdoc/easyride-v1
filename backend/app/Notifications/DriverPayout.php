<?php

namespace App\Notifications;

use App\Services\PushNotificationService;
use App\Services\SmsService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class DriverPayout extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected float $amount,
        protected string $payoutId
    ) {
        $this->onQueue('horizon');
    }

    public function via(object $notifiable): array
    {
        return ['database', 'fcm', 'sms'];
    }

    public function toFcm(object $notifiable): mixed
    {
        return [
            'title' => 'Payout Processed',
            'body' => 'R'.number_format($this->amount, 2).' has been sent to your account.',
        ];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'payout_id' => $this->payoutId,
            'amount' => $this->amount,
            'message' => 'R'.number_format($this->amount, 2).' payout processed',
        ];
    }

    public function sendFcmNotification(object $notifiable): void
    {
        app(PushNotificationService::class)->sendToDevice($notifiable, [
            'title' => 'Payout Processed',
            'body' => 'R'.number_format($this->amount, 2).' has been sent to your account.',
            'channel' => 'easyryde_payments',
        ], [
            'type' => 'driver_payout',
            'payout_id' => $this->payoutId,
            'amount' => number_format($this->amount, 2),
        ]);
    }

    public function sendSmsNotification(object $notifiable): void
    {
        $phone = $notifiable->phone_number;
        if ($phone) {
            app(SmsService::class)->sendDriverPayout($phone, number_format($this->amount, 2));
        }
    }
}

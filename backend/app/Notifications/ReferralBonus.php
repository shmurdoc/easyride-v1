<?php

namespace App\Notifications;

use App\Services\PushNotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class ReferralBonus extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected float $amount,
        protected string $referredByName
    ) {
        $this->onQueue('horizon');
    }

    public function via(object $notifiable): array
    {
        return ['database', 'fcm'];
    }

    public function toFcm(object $notifiable): mixed
    {
        return [
            'title' => 'Referral Bonus!',
            'body' => "You earned R{$this->amount} for referring {$this->referredByName}!",
        ];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'amount' => $this->amount,
            'referred_by' => $this->referredByName,
            'message' => "R{$this->amount} referral bonus from {$this->referredByName}",
        ];
    }

    public function sendFcmNotification(object $notifiable): void
    {
        app(PushNotificationService::class)->sendToDevice($notifiable, [
            'title' => 'Referral Bonus!',
            'body' => "You earned R{$this->amount} for referring {$this->referredByName}!",
            'channel' => 'easyryde_promotions',
        ], [
            'type' => 'referral_bonus',
            'amount' => number_format($this->amount, 2),
            'referred_by' => $this->referredByName,
        ]);
    }
}

<?php

namespace App\Notifications;

use App\Services\EmailService;
use App\Services\PushNotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class WeeklyEarningsReport extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected array $stats
    ) {
        $this->onQueue('horizon');
    }

    public function via(object $notifiable): array
    {
        return ['database', 'fcm', 'email'];
    }

    public function toFcm(object $notifiable): mixed
    {
        return [
            'title' => 'Weekly Earnings Report',
            'body' => "You earned R{$this->stats['total_earnings']} from {$this->stats['total_trips']} trips this week.",
        ];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'stats' => $this->stats,
            'message' => "Weekly earnings: R{$this->stats['total_earnings']}",
        ];
    }

    public function sendFcmNotification(object $notifiable): void
    {
        app(PushNotificationService::class)->sendToDevice($notifiable, [
            'title' => 'Weekly Earnings Report',
            'body' => "You earned R{$this->stats['total_earnings']} from {$this->stats['total_trips']} trips this week.",
            'channel' => 'easyryde_earnings',
        ], [
            'type' => 'weekly_earnings',
            'total_earnings' => (string) $this->stats['total_earnings'],
            'total_trips' => (string) $this->stats['total_trips'],
        ]);
    }

    public function sendEmailNotification(object $notifiable): void
    {
        app(EmailService::class)->sendWeeklyEarningsReport(
            $notifiable->email,
            $notifiable->name,
            $this->stats,
        );
    }
}

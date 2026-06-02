<?php

namespace App\Notifications;

use App\Services\EmailService;
use App\Services\PushNotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class AccountApproved extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected bool $approved,
        protected string $reason = ''
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
            'title' => $this->approved ? 'Account Approved' : 'Application Update',
            'body' => $this->approved
                ? 'Your driver account has been approved! You can now go online.'
                : "Your application was not approved. {$this->reason}",
        ];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'approved' => $this->approved,
            'reason' => $this->reason,
            'message' => $this->approved
                ? 'Your driver account has been approved!'
                : "Your application was not approved: {$this->reason}",
        ];
    }

    public function sendFcmNotification(object $notifiable): void
    {
        app(PushNotificationService::class)->sendToDevice($notifiable, [
            'title' => $this->approved ? 'Account Approved' : 'Application Update',
            'body' => $this->approved
                ? 'Your driver account has been approved! You can now go online.'
                : "Your application was not approved. {$this->reason}",
            'channel' => 'easyryde_account',
        ], [
            'type' => 'account_approved',
            'approved' => $this->approved ? '1' : '0',
        ]);
    }

    public function sendEmailNotification(object $notifiable): void
    {
        app(EmailService::class)->sendDriverApproval(
            $notifiable->email,
            $notifiable->name,
            $this->approved,
            $this->reason,
        );
    }
}

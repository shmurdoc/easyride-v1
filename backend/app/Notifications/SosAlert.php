<?php

namespace App\Notifications;

use App\Models\Ride;
use App\Services\EmailService;
use App\Services\PushNotificationService;
use App\Services\SmsService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class SosAlert extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected Ride $ride,
        protected string $location
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
            'title' => 'SOS ALERT',
            'body' => "Emergency alert from ride #{$this->ride->id}. Immediate action required.",
        ];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'ride_id' => $this->ride->id,
            'location' => $this->location,
            'message' => "SOS alert triggered on ride #{$this->ride->id}",
        ];
    }

    public function sendFcmNotification(object $notifiable): void
    {
        app(PushNotificationService::class)->sendToDevice($notifiable, [
            'title' => 'SOS ALERT',
            'body' => "Emergency alert from ride #{$this->ride->id}. Immediate action required.",
            'channel' => 'easyryde_sos',
        ], [
            'type' => 'sos',
            'ride_id' => $this->ride->id,
            'location' => $this->location,
        ]);
    }

    public function sendAdminAlerts(Ride $ride, string $location): void
    {
        $emailService = app(EmailService::class);
        $pushService = app(PushNotificationService::class);
        $smsService = app(SmsService::class);

        $adminEmail = config('app.admin_email', 'admin@easyryde.co.za');

        $emailService->sendSosAlert(
            $adminEmail,
            $ride->rider->name ?? 'Unknown',
            $ride->id,
            $location,
        );

        $adminUsers = \App\Models\User::role('admin')->get();
        foreach ($adminUsers as $admin) {
            $pushService->sendToDevice($admin, [
                'title' => 'SOS ALERT',
                'body' => "Emergency from {$ride->rider->name} on ride #{$ride->id}",
                'channel' => 'easyryde_sos',
            ], [
                'type' => 'sos_admin',
                'ride_id' => $ride->id,
                'user_id' => $ride->rider_id,
                'location' => $location,
            ]);
        }

        $emergencyPhone = config('app.emergency_phone');
        if ($emergencyPhone) {
            $smsService->sendSosAlert($emergencyPhone, $ride->rider->name ?? 'Unknown', $ride->id);
        }
    }
}

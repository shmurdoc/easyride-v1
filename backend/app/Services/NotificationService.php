<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\InAppNotification;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    public function __construct(
        protected PushNotificationService $pushService,
        protected EmailService $emailService,
        protected SmsService $smsService,
    ) {}

    public function notify(User $user, string $title, string $body, array $options = []): void
    {
        if (isset($options['in_app']) && $options['in_app'] !== false) {
            $this->createInAppNotification($user, $title, $body, $options);
        }

        if (isset($options['push']) && $options['push'] !== false) {
            $this->pushService->sendToDevice($user, [
                'title' => $title,
                'body' => $body,
                'channel' => $options['channel'] ?? 'easyryde_default',
            ], $options['data'] ?? []);
        }

        if (isset($options['email']) && $options['email'] !== false) {
            $this->emailService->send($user->email, $title, $this->buildEmailHtml($title, $body));
        }

        if (isset($options['sms']) && $options['sms'] !== false && $user->phone_number) {
            $this->smsService->send($user->phone_number, "{$title}: {$body}");
        }
    }

    public function notifyAdmins(string $title, string $body, array $options = []): void
    {
        $admins = User::role('admin')->get();
        foreach ($admins as $admin) {
            $this->notify($admin, $title, $body, $options);
        }
    }

    public function notifyRole(string $role, string $title, string $body, array $options = []): void
    {
        $users = User::role($role)->get();
        foreach ($users as $user) {
            $this->notify($user, $title, $body, $options);
        }
    }

    public function broadcast(string $title, string $body, array $options = []): void
    {
        $this->pushService->sendToRole('rider', [
            'title' => $title,
            'body' => $body,
            'channel' => $options['channel'] ?? 'easyryde_broadcast',
        ], $options['data'] ?? []);
    }

    private function createInAppNotification(User $user, string $title, string $body, array $options): void
    {
        try {
            InAppNotification::create([
                'user_id' => $user->id,
                'title' => $title,
                'body' => $body,
                'type' => $options['type'] ?? 'info',
                'data' => $options['data'] ?? null,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create in-app notification', ['error' => $e->getMessage()]);
        }
    }

    private function buildEmailHtml(string $title, string $body): string
    {
        return "<div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;'>
            <div style='background:#2563eb;color:white;padding:20px;border-radius:8px 8px 0 0;'>
                <h1 style='margin:0;font-size:24px;'>EasyRyde</h1>
            </div>
            <div style='background:white;padding:20px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;'>
                <h2>{$title}</h2>
                <p>{$body}</p>
            </div>
        </div>";
    }
}

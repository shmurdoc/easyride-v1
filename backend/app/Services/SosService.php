<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Ride;
use App\Models\SosAlert;
use App\Models\User;
use App\Notifications\SosAlert as SosAlertNotification;
use Illuminate\Support\Facades\Log;

class SosService
{
    private const CANCEL_WINDOW_SECONDS = 10;

    public function triggerSos(User $user, ?Ride $ride, float $lat, float $lng, string $notes = ''): SosAlert
    {
        $alert = SosAlert::create([
            'user_id' => $user->id,
            'ride_id' => $ride?->id,
            'latitude' => $lat,
            'longitude' => $lng,
            'notes' => $notes,
            'status' => 'active',
            'severity' => 'high',
        ]);

        if ($ride) {
            $ride->notify(new SosAlertNotification($ride, "{$lat}, {$lng}"));
        }

        $this->sendAdminAlerts($user, $ride, $lat, $lng);

        Log::critical('SOS ALERT TRIGGERED', [
            'user_id' => $user->id,
            'ride_id' => $ride?->id,
            'location' => "{$lat}, {$lng}",
        ]);

        return $alert;
    }

    public function cancelSos(User $user, string $alertId): array
    {
        $alert = SosAlert::where('id', $alertId)
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->first();

        if (! $alert) {
            return ['success' => false, 'error' => 'Alert not found or already resolved.'];
        }

        $timeSinceCreation = $alert->created_at->diffInSeconds(now());

        if ($timeSinceCreation > self::CANCEL_WINDOW_SECONDS) {
            return ['success' => false, 'error' => 'Cancel window has expired. Alert has been escalated.'];
        }

        $alert->update([
            'status' => 'cancelled',
            'resolved_at' => now(),
            'notes' => 'Cancelled by user within grace period',
        ]);

        return ['success' => true, 'message' => 'SOS alert cancelled.'];
    }

    public function acknowledgeAlert(User $admin, string $alertId, string $notes = ''): array
    {
        $alert = SosAlert::where('id', $alertId)
            ->where('status', 'active')
            ->first();

        if (! $alert) {
            return ['success' => false, 'error' => 'Alert not found or already handled.'];
        }

        $alert->update([
            'status' => 'acknowledged',
            'acknowledged_by' => $admin->id,
            'acknowledged_at' => now(),
            'notes' => $notes,
        ]);

        return ['success' => true, 'message' => 'Alert acknowledged.'];
    }

    public function resolveAlert(User $admin, string $alertId, string $resolution): array
    {
        $alert = SosAlert::where('id', $alertId)
            ->whereIn('status', ['active', 'acknowledged'])
            ->first();

        if (! $alert) {
            return ['success' => false, 'error' => 'Alert not found.'];
        }

        $alert->update([
            'status' => 'resolved',
            'resolved_at' => now(),
            'notes' => $resolution,
        ]);

        return ['success' => true, 'message' => 'Alert resolved.'];
    }

    public function getActiveAlerts(): iterable
    {
        return SosAlert::where('status', 'active')
            ->with('user', 'ride')
            ->latest()
            ->cursor();
    }

    private function sendAdminAlerts(User $user, ?Ride $ride, float $lat, float $lng): void
    {
        $admins = User::role('admin')->get();
        $pushService = app(PushNotificationService::class);
        $smsService = app(SmsService::class);

        foreach ($admins as $admin) {
            $pushService->sendToDevice($admin, [
                'title' => 'SOS ALERT',
                'body' => "Emergency from {$user->name}".($ride ? " on ride #{$ride->id}" : ''),
                'channel' => 'easyryde_sos',
            ], [
                'type' => 'sos',
                'user_id' => $user->id,
                'ride_id' => $ride?->id,
                'latitude' => (string) $lat,
                'longitude' => (string) $lng,
            ]);
        }

        $emergencyPhone = config('app.emergency_phone');
        if ($emergencyPhone) {
            $smsService->sendSosAlert($emergencyPhone, $user->name, $ride?->id ?? 'N/A');
        }
    }
}

<?php

namespace App\Notifications;

use App\Models\Ride;
use App\Services\PushNotificationService;
use App\Services\SmsService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\SmsMessage;
use Illuminate\Notifications\Notification;

class RideStatusChanged extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected Ride $ride,
        protected string $status
    ) {
        $this->onQueue('horizon');
    }

    public function via(object $notifiable): array
    {
        return ['broadcast', 'database', 'fcm', 'sms'];
    }

    public function viaFcm(object $notifiable): array
    {
        return [$this->getFcmNotification()];
    }

    public function toFcm(object $notifiable): mixed
    {
        return $this->getFcmNotification();
    }

    public function toSms(object $notifiable): ?SmsMessage
    {
        $phone = $notifiable->phone_number;
        if (! $phone) {
            return null;
        }

        return null;
    }

    public function sendFcmNotification(object $notifiable): void
    {
        $pushService = app(PushNotificationService::class);
        $pushService->sendToDevice($notifiable, [
            'title' => 'Ride Update',
            'body' => $this->getStatusMessage(),
            'channel' => 'easyryde_rides',
        ], [
            'type' => 'ride_status',
            'ride_id' => $this->ride->id,
            'status' => $this->status,
        ]);
    }

    public function sendSmsNotification(object $notifiable): void
    {
        $smsService = app(SmsService::class);
        $phone = $notifiable->phone_number;
        if (! $phone) {
            return;
        }

        $driverName = $this->ride->driver?->name ?? '';
        $smsService->sendRideStatusUpdate($phone, $this->status, $driverName);
    }

    public function broadcastOn(?object $notifiable = null): array
    {
        return ['ride.'.$this->ride->id];
    }

    public function broadcastType(): string
    {
        return 'ride.status';
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'ride_id' => $this->ride->id,
            'status' => $this->status,
            'driver' => $this->ride->driver ? [
                'id' => $this->ride->driver->id,
                'name' => $this->ride->driver->name,
                'phone_number' => $this->ride->driver->phone_number,
                'rating' => $this->ride->driver->driverProfile?->average_rating,
                'vehicle' => $this->ride->driver->vehicle ? [
                    'make' => $this->ride->driver->vehicle->make,
                    'model' => $this->ride->driver->vehicle->model,
                    'color' => $this->ride->driver->vehicle->color,
                    'plate_number' => $this->ride->driver->vehicle->plate_number,
                ] : null,
            ] : null,
        ]);
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'ride_id' => $this->ride->id,
            'status' => $this->status,
            'message' => $this->getStatusMessage(),
        ];
    }

    private function getFcmNotification(): array
    {
        return [
            'title' => 'Ride Update',
            'body' => $this->getStatusMessage(),
        ];
    }

    private function getStatusMessage(): string
    {
        return match ($this->status) {
            'accepted' => 'Your ride has been accepted!',
            'arrived' => 'Your driver has arrived!',
            'in_progress' => 'Your ride is now in progress.',
            'completed' => 'Your ride is complete. Thank you!',
            'cancelled' => 'Your ride has been cancelled.',
            default => "Ride status: {$this->status}",
        };
    }
}

<?php

namespace App\Notifications;

use App\Models\Ride;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class RideStatusChanged extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected Ride $ride,
        protected string $status
    )
    {
        $this->onQueue('horizon');
    }

    public function via(object $notifiable): array
    {
        return ['broadcast', 'database'];
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
        ];
    }
}

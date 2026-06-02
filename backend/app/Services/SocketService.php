<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Redis;

class SocketService
{
    private static string $prefix = 'laravel_database_';

    public static function broadcastToUser(string $userId, string $event, array $data): void
    {
        self::broadcast("user:{$userId}", $event, $data);
    }

    public static function broadcastToDriver(string $driverId, string $event, array $data): void
    {
        self::broadcast("driver:{$driverId}", $event, $data);
    }

    public static function broadcastToRide(string $rideId, string $event, array $data): void
    {
        self::broadcast("ride:{$rideId}", $event, $data);
    }

    public static function broadcastToDelivery(string $deliveryId, string $event, array $data): void
    {
        self::broadcast("delivery:{$deliveryId}", $event, $data);
    }

    public static function broadcastToAdmins(string $event, array $data): void
    {
        self::broadcast('admin', $event, $data);
    }

    public static function broadcastToAllDrivers(string $event, array $data): void
    {
        $drivers = \App\Models\User::where('role', 'driver')
            ->where('is_online', true)
            ->pluck('id');

        foreach ($drivers as $driverId) {
            self::broadcast("driver:{$driverId}", $event, $data);
        }
    }

    private static function broadcast(string $channel, string $event, array $data): void
    {
        $payload = json_encode([
            'event' => $event,
            'data' => $data,
        ]);

        Redis::publish(self::$prefix . $channel, $payload);
    }
}

<?php

declare(strict_types=1);

namespace App\Enums;

enum UserRole: string
{
    case RIDER = 'rider';
    case DRIVER = 'driver';
    case ADMIN = 'admin';
    case SUPER_ADMIN = 'super-admin';

    public function label(): string
    {
        return match ($this) {
            self::RIDER => 'Rider',
            self::DRIVER => 'Driver',
            self::ADMIN => 'Admin',
            self::SUPER_ADMIN => 'Super Admin',
        };
    }
}

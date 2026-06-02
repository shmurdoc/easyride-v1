<?php

declare(strict_types=1);

namespace App\Enums;

enum RideCategory: string
{
    case ECONOMY = 'economy';
    case STANDARD = 'standard';
    case PREMIUM = 'premium';
    case XL = 'xl';
    case DELIVERY = 'delivery';

    public function label(): string
    {
        return match ($this) {
            self::ECONOMY => 'Economy',
            self::STANDARD => 'Standard',
            self::PREMIUM => 'Premium',
            self::XL => 'XL',
            self::DELIVERY => 'Delivery',
        };
    }
}

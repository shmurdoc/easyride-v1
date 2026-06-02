<?php

declare(strict_types=1);

namespace App\Enums;

enum PaymentMethod: string
{
    case WALLET = 'wallet';
    case CASH = 'cash';
    case CARD = 'card';
    case PAYFAST = 'payfast';
    case OZOW = 'ozow';

    public function label(): string
    {
        return match ($this) {
            self::WALLET => 'Wallet',
            self::CASH => 'Cash',
            self::CARD => 'Card',
            self::PAYFAST => 'PayFast',
            self::OZOW => 'Ozow',
        };
    }
}

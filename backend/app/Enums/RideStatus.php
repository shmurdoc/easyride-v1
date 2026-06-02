<?php

declare(strict_types=1);

namespace App\Enums;

enum RideStatus: string
{
    case SEARCHING = 'searching';
    case ACCEPTED = 'accepted';
    case ARRIVED = 'arrived';
    case IN_PROGRESS = 'in_progress';
    case COMPLETED = 'completed';
    case CANCELLED = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::SEARCHING => 'Searching for driver',
            self::ACCEPTED => 'Driver assigned',
            self::ARRIVED => 'Driver arrived',
            self::IN_PROGRESS => 'In progress',
            self::COMPLETED => 'Completed',
            self::CANCELLED => 'Cancelled',
        };
    }

    public function isTerminal(): bool
    {
        return in_array($this, [self::COMPLETED, self::CANCELLED]);
    }

    public function canBeCancelled(): bool
    {
        return in_array($this, [self::SEARCHING, self::ACCEPTED, self::ARRIVED]);
    }
}

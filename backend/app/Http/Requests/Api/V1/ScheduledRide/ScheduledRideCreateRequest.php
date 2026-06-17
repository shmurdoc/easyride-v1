<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\ScheduledRide;

use App\Http\Requests\Api\V1\ApiFormRequest;

class ScheduledRideCreateRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'category' => 'required|string|in:standard,premium,luxury',
            'pickup_latitude' => 'required|numeric',
            'pickup_longitude' => 'required|numeric',
            'pickup_address' => 'required|string',
            'dropoff_latitude' => 'required|numeric',
            'dropoff_longitude' => 'required|numeric',
            'dropoff_address' => 'required|string',
            'scheduled_at' => 'required|date|after:now',
            'recurrence' => 'nullable|string|in:daily,weekly,monthly',
        ];
    }
}

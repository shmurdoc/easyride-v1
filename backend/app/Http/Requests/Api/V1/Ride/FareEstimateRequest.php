<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Ride;

use App\Http\Requests\Api\V1\ApiFormRequest;

class FareEstimateRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'pickup_lat' => 'required|numeric',
            'pickup_lng' => 'required|numeric',
            'dropoff_lat' => 'required|numeric',
            'dropoff_lng' => 'required|numeric',
            'category' => 'nullable|string|in:economy,standard,premium,delivery',
        ];
    }
}

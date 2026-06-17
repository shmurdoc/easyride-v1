<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Sos;

use App\Http\Requests\Api\V1\ApiFormRequest;

class SosTriggerRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'alert_type' => 'sometimes|string|in:emergency,medical,accident,harassment',
            'ride_id' => 'sometimes|string|exists:rides,id',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ];
    }
}

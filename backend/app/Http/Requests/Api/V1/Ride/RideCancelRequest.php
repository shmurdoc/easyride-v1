<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Ride;

use App\Http\Requests\Api\V1\ApiFormRequest;

class RideCancelRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'cancellation_reason' => 'required|string|max:500',
        ];
    }
}

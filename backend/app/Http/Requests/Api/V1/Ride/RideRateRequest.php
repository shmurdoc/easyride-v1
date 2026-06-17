<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Ride;

use App\Http\Requests\Api\V1\ApiFormRequest;

class RideRateRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('rider');
    }

    public function rules(): array
    {
        return [
            'score' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ];
    }
}

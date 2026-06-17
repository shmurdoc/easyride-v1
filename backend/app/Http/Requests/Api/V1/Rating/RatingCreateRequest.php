<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Rating;

use App\Http\Requests\Api\V1\ApiFormRequest;

class RatingCreateRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'ride_id' => 'required|string|exists:rides,id',
            'score' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ];
    }
}

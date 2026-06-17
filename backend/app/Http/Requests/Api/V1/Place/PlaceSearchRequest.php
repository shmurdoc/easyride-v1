<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Place;

use App\Http\Requests\Api\V1\ApiFormRequest;

class PlaceSearchRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'query' => 'required|string|max:255',
            'limit' => 'nullable|integer|min:1|max:20',
        ];
    }
}

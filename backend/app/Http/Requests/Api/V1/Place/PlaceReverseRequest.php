<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Place;

use App\Http\Requests\Api\V1\ApiFormRequest;

class PlaceReverseRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'lat' => 'required|numeric|between:-90,90',
            'lng' => 'required|numeric|between:-180,180',
        ];
    }
}

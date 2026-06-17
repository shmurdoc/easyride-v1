<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Food;

use App\Http\Requests\Api\V1\ApiFormRequest;

class FoodOrderRateRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ];
    }
}

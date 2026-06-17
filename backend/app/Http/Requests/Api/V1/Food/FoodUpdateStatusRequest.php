<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Food;

use App\Http\Requests\Api\V1\ApiFormRequest;

class FoodUpdateStatusRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'status' => 'required|string|in:confirmed,preparing,ready,picked_up,in_transit,delivered,cancelled',
        ];
    }
}

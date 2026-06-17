<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Promo;

use App\Http\Requests\Api\V1\ApiFormRequest;

class ValidateCodeRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'code' => 'required|string|max:50',
            'ride_amount' => 'sometimes|numeric|min:0',
        ];
    }
}

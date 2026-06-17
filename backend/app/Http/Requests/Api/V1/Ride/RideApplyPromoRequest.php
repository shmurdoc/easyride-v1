<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Ride;

use App\Http\Requests\Api\V1\ApiFormRequest;

class RideApplyPromoRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'code' => 'required|string|exists:promo_codes,code',
        ];
    }
}

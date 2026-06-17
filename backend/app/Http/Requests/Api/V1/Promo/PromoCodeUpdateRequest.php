<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Promo;

use App\Http\Requests\Api\V1\ApiFormRequest;

class PromoCodeUpdateRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasAnyRole(['admin', 'super-admin']);
    }

    public function rules(): array
    {
        return [
            'code' => 'sometimes|string|max:50|unique:promo_codes,code',
            'type' => 'sometimes|string|in:fixed,percentage',
            'value' => 'sometimes|numeric|min:0',
            'min_ride_amount' => 'sometimes|numeric|min:0',
            'max_discount' => 'sometimes|numeric|min:0',
            'max_uses' => 'sometimes|integer|min:1',
            'starts_at' => 'sometimes|date',
            'expires_at' => 'sometimes|date|after:starts_at',
            'is_active' => 'sometimes|boolean',
        ];
    }
}

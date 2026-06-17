<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Admin;

use App\Http\Requests\Api\V1\ApiFormRequest;

class PricingUpdateRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasAnyRole(['admin', 'super-admin']);
    }

    public function rules(): array
    {
        return [
            'category' => 'required|string|in:standard,premium,luxury,delivery,food',
            'base_fare' => 'required|numeric|min:0',
            'per_km_rate' => 'required|numeric|min:0',
            'per_minute_rate' => 'required|numeric|min:0',
            'min_fare' => 'required|numeric|min:0',
            'cancellation_fee' => 'required|numeric|min:0',
        ];
    }
}

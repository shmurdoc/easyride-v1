<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Food;

use App\Http\Requests\Api\V1\ApiFormRequest;

class FoodAssignDriverRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasAnyRole(['admin', 'super-admin']);
    }

    public function rules(): array
    {
        return [
            'driver_id' => 'required|string|exists:users,id',
        ];
    }
}

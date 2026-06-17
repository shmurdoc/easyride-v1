<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Delivery;

use App\Http\Requests\Api\V1\ApiFormRequest;

class AssignDriverRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'driver_id' => 'required|string|exists:users,id',
        ];
    }
}

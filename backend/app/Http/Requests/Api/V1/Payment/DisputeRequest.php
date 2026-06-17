<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Payment;

use App\Http\Requests\Api\V1\ApiFormRequest;

class DisputeRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'reason' => 'required|string|max:100',
            'description' => 'required|string|max:1000',
        ];
    }
}

<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Partner;

use App\Http\Requests\Api\V1\ApiFormRequest;

class OrderStatusRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'order_id' => 'required|string',
            'status' => 'required|string',
        ];
    }
}

<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Delivery;

use App\Http\Requests\Api\V1\ApiFormRequest;

class UpdateStatusRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'status' => 'required|string|in:pending,picked_up,in_transit,delivered,failed,cancelled',
        ];
    }
}

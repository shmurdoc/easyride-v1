<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Admin;

use App\Http\Requests\Api\V1\ApiFormRequest;

class DriverApproveRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasAnyRole(['admin', 'super-admin']);
    }

    public function rules(): array
    {
        return [
            'driver_id' => 'required|string|exists:users,id',
            'action' => 'required|string|in:approve,reject',
            'reason' => 'required_if:action,reject|string|max:1000',
        ];
    }
}

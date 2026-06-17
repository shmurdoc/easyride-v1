<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Notification;

use App\Http\Requests\Api\V1\ApiFormRequest;

class RegisterTokenRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'token' => 'required|string',
            'device_type' => 'required|string|in:ios,android',
        ];
    }
}

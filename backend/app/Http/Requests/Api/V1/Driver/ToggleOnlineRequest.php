<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Driver;

use App\Http\Requests\Api\V1\ApiFormRequest;

class ToggleOnlineRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('driver');
    }

    public function rules(): array
    {
        return [
            'is_online' => 'required|boolean',
            'current_latitude' => 'nullable|numeric|between:-90,90',
            'current_longitude' => 'nullable|numeric|between:-180,180',
        ];
    }
}

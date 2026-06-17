<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Admin;

use App\Http\Requests\Api\V1\ApiFormRequest;

class AdminSettingsRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasAnyRole(['admin', 'super-admin']);
    }

    public function rules(): array
    {
        return [
            'key' => 'required|string',
            'value' => 'required',
            'description' => 'nullable|string',
            'type' => 'nullable|string|in:string,boolean,number,json',
        ];
    }
}

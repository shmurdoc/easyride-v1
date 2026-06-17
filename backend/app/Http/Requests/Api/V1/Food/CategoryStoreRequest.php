<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Food;

use App\Http\Requests\Api\V1\ApiFormRequest;

class CategoryStoreRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasAnyRole(['admin', 'super-admin']);
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:100',
            'sort_order' => 'sometimes|integer|min:0',
        ];
    }
}

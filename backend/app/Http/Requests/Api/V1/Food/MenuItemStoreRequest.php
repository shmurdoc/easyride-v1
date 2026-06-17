<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Food;

use App\Http\Requests\Api\V1\ApiFormRequest;

class MenuItemStoreRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasAnyRole(['admin', 'super-admin']);
    }

    public function rules(): array
    {
        return [
            'category_id' => 'sometimes|nullable|exists:restaurant_categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'price' => 'required|numeric|min:0',
            'image_url' => 'nullable|string|max:500',
            'is_available' => 'sometimes|boolean',
            'is_vegetarian' => 'sometimes|boolean',
            'is_vegan' => 'sometimes|boolean',
            'is_gluten_free' => 'sometimes|boolean',
            'spice_level' => 'sometimes|integer|min:0|max:5',
            'preparation_time_minutes' => 'nullable|integer|min:1',
            'calories' => 'nullable|integer|min:0',
            'sort_order' => 'sometimes|integer|min:0',
        ];
    }
}

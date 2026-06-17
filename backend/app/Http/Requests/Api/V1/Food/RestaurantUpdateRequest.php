<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Food;

use App\Http\Requests\Api\V1\ApiFormRequest;

class RestaurantUpdateRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasAnyRole(['admin', 'super-admin']);
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string|max:2000',
            'image_url' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'address' => 'sometimes|string|max:500',
            'latitude' => 'sometimes|numeric|between:-90,90',
            'longitude' => 'sometimes|numeric|between:-180,180',
            'cuisine_type' => 'nullable|string|max:100',
            'price_range' => 'sometimes|string|max:10',
            'delivery_fee' => 'sometimes|numeric|min:0',
            'minimum_order' => 'sometimes|numeric|min:0',
            'estimated_delivery_minutes' => 'sometimes|integer|min:5|max:120',
            'is_active' => 'sometimes|boolean',
            'is_featured' => 'sometimes|boolean',
            'opens_at' => 'nullable|date_format:H:i',
            'closes_at' => 'nullable|date_format:H:i',
        ];
    }
}

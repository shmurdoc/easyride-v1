<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Restaurant extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'tenant_id', 'name', 'slug', 'description', 'image_url',
        'phone', 'email', 'address', 'latitude', 'longitude',
        'cuisine_type', 'price_range', 'delivery_fee',
        'minimum_order', 'estimated_delivery_minutes',
        'is_active', 'is_featured', 'opens_at', 'closes_at',
        'rating', 'rating_count', 'total_orders',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'delivery_fee' => 'decimal:2',
            'minimum_order' => 'decimal:2',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'rating' => 'decimal:2',
        ];
    }

    public function menuItems(): HasMany
    {
        return $this->hasMany(MenuItem::class);
    }

    public function categories(): HasMany
    {
        return $this->hasMany(RestaurantCategory::class);
    }

    public function foodOrders(): HasMany
    {
        return $this->hasMany(FoodOrder::class);
    }
}

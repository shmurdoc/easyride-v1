<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Ride extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'tenant_id', 'rider_id', 'driver_id', 'pickup_latitude', 'pickup_longitude',
        'dropoff_latitude', 'dropoff_longitude', 'pickup_address', 'dropoff_address',
        'status', 'category', 'distance_km', 'duration_minutes',
        'base_fare', 'per_km_fare', 'surge_multiplier', 'total_fare',
        'promo_code_id', 'discount_amount', 'payment_method', 'payment_status',
        'driver_eta', 'started_at', 'completed_at', 'cancelled_at', 'cancelled_by',
        'route_polyline', 'cancellation_reason',
    ];

    protected function casts(): array
    {
        return [
            'pickup_latitude' => 'decimal:7',
            'pickup_longitude' => 'decimal:7',
            'dropoff_latitude' => 'decimal:7',
            'dropoff_longitude' => 'decimal:7',
            'distance_km' => 'decimal:3',
            'duration_minutes' => 'decimal:1',
            'base_fare' => 'decimal:2',
            'per_km_fare' => 'decimal:2',
            'surge_multiplier' => 'decimal:2',
            'total_fare' => 'decimal:2',
            'driver_eta' => 'integer',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function rider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rider_id');
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function rating(): HasOne
    {
        return $this->hasOne(Rating::class);
    }

    public function delivery(): HasOne
    {
        return $this->hasOne(Delivery::class);
    }
}

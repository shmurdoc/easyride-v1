<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Delivery extends Model
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'tenant_id', 'ride_id', 'type', 'description',
        'sender_name', 'sender_phone', 'recipient_name', 'recipient_phone',
        'recipient_address', 'recipient_latitude', 'recipient_longitude',
        'pickup_notes', 'delivery_notes', 'package_size', 'package_weight_kg',
        'estimated_value', 'requires_signature', 'is_fragile', 'status',
        'picked_up_at', 'delivered_at',
    ];

    protected function casts(): array
    {
        return [
            'recipient_latitude' => 'decimal:7',
            'recipient_longitude' => 'decimal:7',
            'package_weight_kg' => 'decimal:2',
            'estimated_value' => 'decimal:2',
            'requires_signature' => 'boolean',
            'is_fragile' => 'boolean',
            'picked_up_at' => 'datetime',
            'delivered_at' => 'datetime',
        ];
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function ride(): BelongsTo
    {
        return $this->belongsTo(Ride::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashReconciliation extends Model
{
    use HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'ride_id', 'driver_id', 'rider_id', 'fare_amount', 'platform_fee',
        'driver_earns', 'driver_marked_at', 'admin_reconciled_at', 'status', 'notes',
    ];

    protected $casts = [
        'fare_amount' => 'decimal:2',
        'platform_fee' => 'decimal:2',
        'driver_earns' => 'decimal:2',
        'driver_marked_at' => 'datetime',
        'admin_reconciled_at' => 'datetime',
    ];

    public function ride(): BelongsTo
    {
        return $this->belongsTo(Ride::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function rider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rider_id');
    }
}

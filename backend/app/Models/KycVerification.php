<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KycVerification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'verification_type',
        'document_type',
        'document_number',
        'document_front_path',
        'document_back_path',
        'selfie_path',
        'status',
        'rejection_reason',
        'verified_at',
        'verified_by',
        'expires_at',
        'metadata',
    ];

    protected $casts = [
        'verified_at' => 'datetime',
        'expires_at' => 'datetime',
        'metadata' => 'array',
    ];

    const STATUS_PENDING = 'pending';
    const STATUS_UNDER_REVIEW = 'under_review';
    const STATUS_APPROVED = 'approved';
    const STATUS_REJECTED = 'rejected';
    const STATUS_EXPIRED = 'expired';

    const TYPE_ID_DOCUMENT = 'id_document';
    const TYPE_DRIVERS_LICENSE = 'drivers_license';
    const TYPE_PROOF_OF_ADDRESS = 'proof_of_address';
    const TYPE_VEHICLE_REGISTRATION = 'vehicle_registration';
    const TYPE_VEHICLE_INSURANCE = 'vehicle_insurance';
    const TYPE_PSV_LICENSE = 'psv_license';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function approve(int $verifiedBy): void
    {
        $this->update([
            'status' => self::STATUS_APPROVED,
            'verified_at' => now(),
            'verified_by' => $verifiedBy,
        ]);
    }

    public function reject(string $reason, int $verifiedBy): void
    {
        $this->update([
            'status' => self::STATUS_REJECTED,
            'rejection_reason' => $reason,
            'verified_by' => $verifiedBy,
        ]);
    }
}

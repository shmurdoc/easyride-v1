<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\ConsentRecord;
use App\Models\User;

class UserConsentService
{
    private const CONSENT_TYPES = [
        'terms_of_service' => [
            'required' => true,
            'description' => 'Terms of Service',
            'version' => '1.0',
        ],
        'privacy_policy' => [
            'required' => true,
            'description' => 'Privacy Policy (POPIA)',
            'version' => '1.0',
        ],
        'marketing_email' => [
            'required' => false,
            'description' => 'Marketing emails',
            'version' => '1.0',
        ],
        'marketing_sms' => [
            'required' => false,
            'description' => 'Marketing SMS',
            'version' => '1.0',
        ],
        'location_tracking' => [
            'required' => true,
            'description' => 'Location tracking for rides',
            'version' => '1.0',
        ],
        'data_sharing_partners' => [
            'required' => false,
            'description' => 'Data sharing with delivery partners',
            'version' => '1.0',
        ],
        'biometric_data' => [
            'required' => false,
            'description' => 'Biometric verification',
            'version' => '1.0',
        ],
    ];

    public function grantConsent(
        User $user,
        string $consentType,
        string $ipAddress,
        string $userAgent,
    ): ConsentRecord {
        $this->validateConsentType($consentType);

        $existing = ConsentRecord::where('user_id', $user->id)
            ->where('consent_type', $consentType)
            ->whereNull('revoked_at')
            ->first();

        if ($existing) {
            return $existing;
        }

        ConsentRecord::where('user_id', $user->id)
            ->where('consent_type', $consentType)
            ->update(['revoked_at' => now()]);

        return ConsentRecord::create([
            'user_id' => $user->id,
            'consent_type' => $consentType,
            'consent_version' => self::CONSENT_TYPES[$consentType]['version'],
            'granted_at' => now(),
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'metadata' => [
                'consent_description' => self::CONSENT_TYPES[$consentType]['description'],
            ],
        ]);
    }

    public function revokeConsent(User $user, string $consentType): void
    {
        $this->validateConsentType($consentType);

        $consent = ConsentRecord::where('user_id', $user->id)
            ->where('consent_type', $consentType)
            ->whereNull('revoked_at')
            ->first();

        if ($consent) {
            $consent->revoke();
        }
    }

    public function hasConsent(User $user, string $consentType): bool
    {
        $this->validateConsentType($consentType);

        return ConsentRecord::where('user_id', $user->id)
            ->where('consent_type', $consentType)
            ->whereNull('revoked_at')
            ->exists();
    }

    public function getAllConsents(User $user): array
    {
        $consents = ConsentRecord::where('user_id', $user->id)
            ->whereNull('revoked_at')
            ->pluck('consent_type')
            ->toArray();

        $result = [];
        foreach (self::CONSENT_TYPES as $type => $config) {
            $result[$type] = [
                'type' => $type,
                'description' => $config['description'],
                'required' => $config['required'],
                'version' => $config['version'],
                'granted' => in_array($type, $consents),
            ];
        }

        return $result;
    }

    public function getConsentHistory(User $user): array
    {
        return ConsentRecord::where('user_id', $user->id)
            ->orderByDesc('granted_at')
            ->get()
            ->toArray();
    }

    public function hasAllRequiredConsents(User $user): bool
    {
        foreach (self::CONSENT_TYPES as $type => $config) {
            if ($config['required'] && ! $this->hasConsent($user, $type)) {
                return false;
            }
        }

        return true;
    }

    private function validateConsentType(string $type): void
    {
        if (! isset(self::CONSENT_TYPES[$type])) {
            throw new \InvalidArgumentException("Invalid consent type: {$type}");
        }
    }
}

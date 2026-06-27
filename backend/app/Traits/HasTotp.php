<?php

declare(strict_types=1);

namespace App\Traits;

use Illuminate\Support\Facades\Cache;
use PragmaRX\Google2FA\Google2FA;

trait HasTotp
{
    public function generateTotpSecret(): string
    {
        $google2fa = new Google2FA;
        $secret = $google2fa->generateSecretKey();

        $this->totp_secret = $secret;
        $this->save();

        return $secret;
    }

    public function verifyTotp(string $code): bool
    {
        if (! $this->totp_secret) {
            return false;
        }

        $cacheKey = 'totp_used_'.$this->id.'_'.$code;
        if (Cache::has($cacheKey)) {
            return false;
        }

        $google2fa = new Google2FA;
        $valid = $google2fa->verifyKey($this->totp_secret, $code);

        if ($valid) {
            Cache::put($cacheKey, true, 60);
        }

        return $valid;
    }

    public function getTotpQrUrl(string $issuer): string
    {
        if (! $this->totp_secret) {
            return '';
        }

        $google2fa = new Google2FA;

        return $google2fa->getQRCodeUrl(
            $issuer,
            $this->email,
            $this->totp_secret
        );
    }
}

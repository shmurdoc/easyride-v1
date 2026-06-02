<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\ReferralCode;
use App\Models\ReferralRedemption;
use App\Models\User;
use App\Notifications\ReferralBonus;
use Illuminate\Support\Str;

class ReferralService
{
    private const BONUS_AMOUNT = 25.00;
    private const MAX_REFERRALS_PER_MONTH = 50;

    public function generateCode(User $user): ReferralCode
    {
        $existing = ReferralCode::where('user_id', $user->id)->where('is_active', true)->first();
        if ($existing) return $existing;

        do {
            $code = strtoupper(Str::random(8));
        } while (ReferralCode::where('code', $code)->exists());

        return ReferralCode::create([
            'user_id' => $user->id,
            'code' => $code,
        ]);
    }

    public function applyReferral(User $referredUser, string $code): array
    {
        $referralCode = ReferralCode::where('code', $code)
            ->where('is_active', true)
            ->first();

        if (!$referralCode) {
            return ['success' => false, 'error' => 'Invalid referral code.'];
        }

        if ($referralCode->user_id === $referredUser->id) {
            return ['success' => false, 'error' => 'You cannot refer yourself.'];
        }

        $existingRedemption = ReferralRedemption::where('referred_id', $referredUser->id)->first();
        if ($existingRedemption) {
            return ['success' => false, 'error' => 'You have already been referred.'];
        }

        $referrer = User::find($referralCode->user_id);
        if (!$referrer) {
            return ['success' => false, 'error' => 'Referrer not found.'];
        }

        $monthlyCount = ReferralRedemption::where('referrer_id', $referrer->id)
            ->whereMonth('created_at', now()->month)
            ->count();

        if ($monthlyCount >= self::MAX_REFERRALS_PER_MONTH) {
            return ['success' => false, 'error' => 'Referrer has reached the monthly limit.'];
        }

        $redemption = ReferralRedemption::create([
            'referral_code_id' => $referralCode->id,
            'referrer_id' => $referrer->id,
            'referred_id' => $referredUser->id,
            'bonus_amount' => self::BONUS_AMOUNT,
        ]);

        $referralCode->increment('usage_count');

        return [
            'success' => true,
            'referrer_name' => $referrer->name,
            'bonus_amount' => self::BONUS_AMOUNT,
        ];
    }

    public function completeReferral(User $referredUser): void
    {
        $redemption = ReferralRedemption::where('referred_id', $referredUser->id)
            ->where('bonus_paid', false)
            ->first();

        if (!$redemption) return;

        $walletService = app(WalletService::class);
        $referrer = User::find($redemption->referrer_id);

        if ($referrer) {
            $wallet = $walletService->getOrCreateWallet($referrer);
            $walletService->credit(
                $wallet,
                self::BONUS_AMOUNT,
                'referral_bonus',
                $redemption->id,
                "Referral bonus for referring {$referredUser->name}",
            );

            $referrer->notify(new ReferralBonus(self::BONUS_AMOUNT, $referredUser->name));
        }

        $referredWallet = $walletService->getOrCreateWallet($referredUser);
        $walletService->credit(
            $referredWallet,
            self::BONUS_AMOUNT,
            'referral_bonus',
            $redemption->id,
            "Welcome bonus for joining via referral",
        );

        $redemption->update([
            'bonus_paid' => true,
            'completed_at' => now(),
        ]);
    }

    public function getUserCode(User $user): ?ReferralCode
    {
        return ReferralCode::where('user_id', $user->id)
            ->where('is_active', true)
            ->first();
    }

    public function getReferralStats(User $user): array
    {
        $code = $this->getUserCode($user);
        if (!$code) return ['total_referrals' => 0, 'total_bonus' => 0];

        $redemptions = ReferralRedemption::where('referrer_id', $user->id)->get();

        return [
            'code' => $code->code,
            'total_referrals' => $redemptions->count(),
            'total_bonus' => $redemptions->sum('bonus_amount'),
            'pending_bonus' => $redemptions->where('bonus_paid', false)->sum('bonus_amount'),
        ];
    }
}

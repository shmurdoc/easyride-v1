<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\UserConsentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConsentController extends Controller
{
    public function __construct(
        private UserConsentService $consentService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $consents = $this->consentService->getAllConsents($request->user());

        return response()->json(['consents' => $consents]);
    }

    public function grant(Request $request): JsonResponse
    {
        $request->validate([
            'consent_type' => 'required|string|in:terms_of_service,privacy_policy,marketing_email,marketing_sms,location_tracking,data_sharing_partners,biometric_data',
        ]);

        $consent = $this->consentService->grantConsent(
            $request->user(),
            $request->consent_type,
            $request->ip(),
            $request->userAgent(),
        );

        return response()->json([
            'message' => 'Consent granted',
            'consent' => $consent,
        ]);
    }

    public function revoke(Request $request): JsonResponse
    {
        $request->validate([
            'consent_type' => 'required|string',
        ]);

        $this->consentService->revokeConsent($request->user(), $request->consent_type);

        return response()->json(['message' => 'Consent revoked']);
    }

    public function history(Request $request): JsonResponse
    {
        $history = $this->consentService->getConsentHistory($request->user());

        return response()->json(['history' => $history]);
    }
}

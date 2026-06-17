<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Consent\ConsentGrantRequest;
use App\Http\Requests\Api\V1\Consent\ConsentRevokeRequest;
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

    public function grant(ConsentGrantRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $consent = $this->consentService->grantConsent(
            $request->user(),
            $validated['consent_type'],
            $request->ip(),
            $request->userAgent(),
        );

        return response()->json([
            'message' => 'Consent granted',
            'consent' => $consent,
        ]);
    }

    public function revoke(ConsentRevokeRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $this->consentService->revokeConsent($request->user(), $validated['consent_type']);

        return response()->json(['message' => 'Consent revoked']);
    }

    public function history(Request $request): JsonResponse
    {
        $history = $this->consentService->getConsentHistory($request->user());

        return response()->json(['history' => $history]);
    }
}

<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Kyc\KycRejectRequest;
use App\Http\Requests\Api\V1\Kyc\KycSubmitRequest;
use App\Models\KycVerification;
use App\Services\KycService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class KycController extends Controller
{
    public function __construct(
        private KycService $kycService,
    ) {}

    public function submit(KycSubmitRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $verification = $this->kycService->submitVerification(
            $request->user(),
            $validated['verification_type'],
            $validated['document_type'],
            $validated['document_number'],
            $request->file('document_front'),
            $request->file('document_back'),
        );

        return response()->json([
            'message' => 'Verification submitted',
            'verification' => $verification,
        ], 201);
    }

    public function myVerifications(Request $request): JsonResponse
    {
        $verifications = $this->kycService->getUserVerifications($request->user());

        return response()->json(['verifications' => $verifications]);
    }

    public function pending(Request $request): JsonResponse
    {
        $verifications = $this->kycService->getPendingVerifications();

        return response()->json(['verifications' => $verifications]);
    }

    public function approve(Request $request, KycVerification $verification): JsonResponse
    {
        $this->kycService->approveVerification($verification, $request->user()->id);

        return response()->json(['message' => 'Verification approved']);
    }

    public function reject(KycRejectRequest $request, KycVerification $verification): JsonResponse
    {
        $validated = $request->validated();

        $this->kycService->rejectVerification($verification, $validated['reason'], $request->user()->id);

        return response()->json(['message' => 'Verification rejected']);
    }

    public function download(KycVerification $verification, string $documentType): Response
    {
        return $this->kycService->downloadDocument($verification, $documentType);
    }
}

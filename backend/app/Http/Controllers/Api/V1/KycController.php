<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\KycVerification;
use App\Services\KycService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KycController extends Controller
{
    public function __construct(
        private KycService $kycService,
    ) {}

    public function submit(Request $request): JsonResponse
    {
        $request->validate([
            'verification_type' => 'required|string|in:id_document,drivers_license,proof_of_address,vehicle_registration,vehicle_insurance,psv_license',
            'document_type' => 'required|string|in:id_document,drivers_license,proof_of_address,vehicle_registration,vehicle_insurance,psv_license',
            'document_number' => 'required|string|max:20',
            'document_front' => 'required|file|mimes:jpg,jpeg,png,pdf|max:10240',
            'document_back' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:10240',
            'selfie' => 'nullable|file|mimes:jpg,jpeg,png|max:5120',
            'expires_at' => 'nullable|date|after:today',
        ]);

        $verification = $this->kycService->submitVerification(
            $request->user(),
            $request->verification_type,
            $request->document_type,
            $request->document_number,
            $request->file('document_front'),
            $request->file('document_back'),
            $request->file('selfie'),
            $request->expires_at,
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

    public function reject(Request $request, KycVerification $verification): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $this->kycService->rejectVerification($verification, $request->reason, $request->user()->id);

        return response()->json(['message' => 'Verification rejected']);
    }

    public function download(KycVerification $verification, string $documentType): \Symfony\Component\HttpFoundation\Response
    {
        return $this->kycService->downloadDocument($verification, $documentType);
    }
}

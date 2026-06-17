<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\DataRetentionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DataRetentionController extends Controller
{
    public function __construct(
        private DataRetentionService $retentionService,
    ) {}

    public function retentionInfo(): JsonResponse
    {
        $info = $this->retentionService->getRetentionInfo();

        return response()->json(['retention' => $info]);
    }

    public function runCleanup(): JsonResponse
    {
        $results = $this->retentionService->runCleanup();

        return response()->json([
            'message' => 'Cleanup completed',
            'results' => $results,
        ]);
    }

    public function requestErasure(Request $request): JsonResponse
    {
        $user = $request->user();

        $this->retentionService->deleteUserData($user);

        return response()->json([
            'message' => 'Your data has been deleted',
        ]);
    }

    public function requestAnonymization(Request $request): JsonResponse
    {
        $user = $request->user();

        $this->retentionService->anonymizeUser($user);

        return response()->json([
            'message' => 'Your account has been anonymized',
        ]);
    }

    public function exportData(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = [
            'profile' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone_number,
                'created_at' => $user->created_at,
            ],
            'rides' => $user->ridesAsRider()->get(['id', 'pickup_address', 'dropoff_address', 'total_fare', 'created_at']),
            'payments' => $user->payments()->get(['id', 'amount', 'method', 'status', 'created_at']),
            'consents' => $user->consentRecords()->get(['consent_type', 'granted_at', 'revoked_at']),
            'kyc' => $user->kycVerifications()->get(['document_type', 'status', 'created_at']),
        ];

        return response()->json(['data' => $data]);
    }
}

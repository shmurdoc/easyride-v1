<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Referral\ReferralApplyRequest;
use App\Services\ReferralService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReferralController extends Controller
{
    public function __construct(
        protected ReferralService $referralService,
    ) {}

    public function myCode(Request $request): JsonResponse
    {
        $code = $this->referralService->getUserCode($request->user());

        if (! $code) {
            $code = $this->referralService->generateCode($request->user());
        }

        return response()->json([
            'code' => $code->code,
            'usage_count' => $code->usage_count,
            'max_uses' => $code->max_uses,
        ]);
    }

    public function apply(ReferralApplyRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $result = $this->referralService->applyReferral($request->user(), $validated['code']);

        if (! $result['success']) {
            return response()->json($result, 422);
        }

        return response()->json($result);
    }

    public function stats(Request $request): JsonResponse
    {
        return response()->json($this->referralService->getReferralStats($request->user()));
    }
}

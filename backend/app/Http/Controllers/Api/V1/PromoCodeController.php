<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\PromoCode;
use App\Services\PromoCodeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PromoCodeController extends Controller
{
    public function __construct(
        protected PromoCodeService $promoCodeService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $promoCodes = PromoCode::query()
            ->when($request->tenant_id, fn ($q, $v) => $q->where('tenant_id', $v))
            ->when($request->is_active, fn ($q, $v) => $q->where('is_active', filter_var($v, FILTER_VALIDATE_BOOLEAN)))
            ->when($request->search, fn ($q, $v) => $q->where('code', 'like', "%{$v}%"))
            ->latest()
            ->paginate($request->per_page ?? 15);

        return response()->json($promoCodes);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:promo_codes,code',
            'type' => 'required|string|in:fixed,percentage',
            'value' => 'required|numeric|min:0',
            'min_ride_amount' => 'sometimes|numeric|min:0',
            'max_discount' => 'sometimes|numeric|min:0',
            'max_uses' => 'sometimes|integer|min:1',
            'starts_at' => 'sometimes|date',
            'expires_at' => 'sometimes|date|after:starts_at',
            'is_active' => 'sometimes|boolean',
        ]);

        $promoCode = PromoCode::create([
            'tenant_id' => $request->user()->tenant_id,
            ...$validated,
        ]);

        return response()->json($promoCode, 201);
    }

    public function show(PromoCode $promoCode): JsonResponse
    {
        return response()->json($promoCode->load('tenant'));
    }

    public function update(Request $request, PromoCode $promoCode): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'sometimes|string|max:50|unique:promo_codes,code,' . $promoCode->id,
            'type' => 'sometimes|string|in:fixed,percentage',
            'value' => 'sometimes|numeric|min:0',
            'min_ride_amount' => 'sometimes|numeric|min:0',
            'max_discount' => 'sometimes|numeric|min:0',
            'max_uses' => 'sometimes|integer|min:1',
            'starts_at' => 'sometimes|date',
            'expires_at' => 'sometimes|date|after:starts_at',
            'is_active' => 'sometimes|boolean',
        ]);

        $promoCode->update($validated);

        return response()->json($promoCode);
    }

    public function destroy(PromoCode $promoCode): JsonResponse
    {
        $promoCode->delete();

        return response()->json(null, 204);
    }

    public function validateCode(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50',
            'ride_amount' => 'sometimes|numeric|min:0',
        ]);

        try {
            $promo = $this->promoCodeService->validateCode(
                $validated['code'],
                $request->user()->tenant_id,
                $validated['ride_amount'] ?? null,
            );

            $discount = $this->promoCodeService->applyDiscount($promo, $validated['ride_amount'] ?? 0);

            return response()->json([
                'valid' => true,
                'promo_code' => $promo,
                'discount' => $discount,
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'valid' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}

<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\PartnerApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PartnerWebhookController extends Controller
{
    public function __construct(
        protected PartnerApiService $partnerService,
    ) {}

    public function receiveOrder(Request $request): JsonResponse
    {
        $delivery = $this->partnerService->receiveOrder($request->all());

        if (!$delivery) {
            return response()->json(['message' => 'Invalid webhook or order creation failed.'], 422);
        }

        return response()->json([
            'message' => 'Order received',
            'order_id' => $delivery->id,
            'fare' => $delivery->fare_amount,
        ], 201);
    }

    public function orderStatus(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_id' => 'required|string',
            'status' => 'required|string',
        ]);

        $delivery = \App\Models\Delivery::where('partner_reference', $validated['order_id'])->first();

        if (!$delivery) {
            return response()->json(['message' => 'Order not found.'], 404);
        }

        return response()->json(['message' => 'Status updated']);
    }
}

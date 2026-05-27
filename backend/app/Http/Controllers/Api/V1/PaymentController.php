<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Ride;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(
        protected PaymentService $paymentService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $payments = Payment::where('payer_id', $request->user()->id)
            ->when($request->status, fn($q, $v) => $q->where('status', $v))
            ->when($request->method, fn($q, $v) => $q->where('payment_method', $v))
            ->with('ride')
            ->latest()
            ->paginate($request->per_page ?? 15);

        return response()->json($payments);
    }

    public function show(Payment $payment): JsonResponse
    {
        if ($payment->payer_id !== request()->user()->id && !request()->user()->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        return response()->json($payment->load(['ride', 'payer']));
    }

    public function methods(Request $request): JsonResponse
    {
        $payments = Payment::where('payer_id', $request->user()->id)
            ->whereNotNull('payment_method')
            ->select('payment_method', 'gateway')
            ->distinct()
            ->get();

        return response()->json($payments);
    }

    public function processRidePayment(Request $request, Ride $ride): JsonResponse
    {
        if ($ride->rider_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($ride->status !== 'completed') {
            return response()->json(['message' => 'Ride is not completed.'], 422);
        }

        if ($ride->payment) {
            return response()->json(['message' => 'Payment already processed.'], 422);
        }

        $validated = $request->validate([
            'payment_method' => 'required|string',
            'gateway' => 'sometimes|string',
        ]);

        $payment = $this->paymentService->processRidePayment($ride, $validated);

        return response()->json($payment, 201);
    }
}

<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Ride;
use App\Services\CashPaymentService;
use App\Services\EscrowService;
use App\Services\OzowService;
use App\Services\PayFastService;
use App\Services\PaymentService;
use App\Services\RefundService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(
        protected PaymentService $paymentService,
        protected PayFastService $payFastService,
        protected OzowService $ozowService,
        protected EscrowService $escrowService,
        protected RefundService $refundService,
        protected CashPaymentService $cashPaymentService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $payments = Payment::where('payer_id', $request->user()->id)
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->when($request->method, fn ($q, $v) => $q->where('method', $v))
            ->with('ride')
            ->latest()
            ->paginate($request->per_page ?? 15);

        return response()->json($payments);
    }

    public function show(Payment $payment): JsonResponse
    {
        $user = request()->user();
        if ($payment->payer_id !== $user->id && $payment->payee_id !== $user->id && !$user->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        return response()->json($payment->load(['ride', 'payer', 'payee']));
    }

    public function methods(Request $request): JsonResponse
    {
        return response()->json([
            'methods' => [
                ['id' => 'wallet', 'name' => 'Wallet', 'available' => true],
                ['id' => 'cash', 'name' => 'Cash', 'available' => true],
                ['id' => 'payfast', 'name' => 'PayFast', 'available' => true],
                ['id' => 'ozow', 'name' => 'Ozow EFT', 'available' => true],
            ],
        ]);
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

        $velocity = $this->checkPaymentVelocity($request->user()->id, (float) $ride->total_fare);
        if ($velocity !== null) {
            return response()->json([
                'message' => $velocity['message'],
                'code' => $velocity['code'],
            ], 429);
        }

        $validated = $request->validate([
            'method' => 'required|string|in:wallet,cash,payfast,ozow',
        ]);

        $method = $validated['method'];

        if ($method === 'wallet') {
            $payment = $this->escrowService->holdPayment($ride, 'wallet');
            return response()->json(['payment' => $payment, 'message' => 'Payment processed via wallet.'], 201);
        }

        if ($method === 'cash') {
            $payment = $this->cashPaymentService->processCashPayment($ride);
            return response()->json(['payment' => $payment, 'message' => 'Cash payment recorded.'], 201);
        }

        if ($method === 'payfast') {
            $payment = Payment::create([
                'ride_id' => $ride->id,
                'payer_id' => $ride->rider_id,
                'method' => 'payfast',
                'gateway' => 'payfast',
                'amount' => $ride->total_fare,
                'platform_fee' => $this->paymentService->calculatePlatformFee((float) $ride->total_fare),
                'status' => Payment::STATUS_PENDING,
            ]);

            $url = $this->payFastService->generatePaymentUrl([
                'payment_id' => $payment->id,
                'amount' => (float) $ride->total_fare,
                'item_name' => "Ride #{$ride->id}",
                'item_description' => "{$ride->pickup_address} → {$ride->dropoff_address}",
                'name_first' => $ride->rider->name ?? '',
                'email' => $ride->rider->email ?? '',
            ]);

            return response()->json([
                'payment' => $payment,
                'redirect_url' => $url,
                'message' => 'Redirect to PayFast to complete payment.',
            ], 201);
        }

        if ($method === 'ozow') {
            $payment = Payment::create([
                'ride_id' => $ride->id,
                'payer_id' => $ride->rider_id,
                'method' => 'ozow',
                'gateway' => 'ozow',
                'amount' => $ride->total_fare,
                'platform_fee' => $this->paymentService->calculatePlatformFee((float) $ride->total_fare),
                'status' => Payment::STATUS_PENDING,
            ]);

            $result = $this->ozowService->createPayment([
                'amount' => (float) $ride->total_fare,
                'transaction_reference' => $payment->id,
                'customer' => [
                    'name' => $ride->rider->name ?? '',
                    'email' => $ride->rider->email ?? '',
                    'phone' => $ride->rider->phone_number ?? '',
                ],
            ]);

            if (!$result['success']) {
                return response()->json(['message' => $result['error'] ?? 'Ozow payment failed.'], 502);
            }

            return response()->json([
                'payment' => $payment,
                'redirect_url' => $result['url'],
                'message' => 'Redirect to Ozow to complete payment.',
            ], 201);
        }

        return response()->json(['message' => 'Invalid payment method.'], 422);
    }

    public function payfastWebhook(Request $request): JsonResponse
    {
        if ($this->payFastService->verifyItn($request)) {
            $paymentId = $request->input('m_payment_id');
            $payment = Payment::find($paymentId);

            if ($payment && $payment->status === Payment::STATUS_PENDING) {
                $this->escrowService->holdPayment(
                    $payment->ride,
                    'payfast',
                    ['gateway' => 'payfast', 'reference' => $request->input('pf_payment_id')],
                );
            }

            return response()->json(['status' => 'success']);
        }

        return response()->json(['status' => 'invalid'], 400);
    }

    public function payfastReturn(Request $request): JsonResponse
    {
        $paymentId = $request->input('m_payment_id');
        $payment = Payment::find($paymentId);

        return response()->json([
            'status' => 'returned',
            'payment_status' => $payment?->status ?? 'unknown',
        ]);
    }

    public function ozowWebhook(Request $request): JsonResponse
    {
        if ($this->ozowService->verifyWebhook($request)) {
            $transactionReference = $request->input('TransactionReference') ?? $request->input('transactionReference');
            $status = $request->input('Status') ?? $request->input('status');

            $payment = Payment::find($transactionReference);

            if ($payment) {
                if (strtolower((string) $status) === 'complete') {
                    $this->escrowService->holdPayment(
                        $payment->ride,
                        'ozow',
                        ['gateway' => 'ozow', 'reference' => $request->input('PaymentReference')],
                    );
                } else {
                    $payment->update(['status' => Payment::STATUS_FAILED]);
                }
            }

            return response()->json(['status' => 'success']);
        }

        return response()->json(['status' => 'invalid'], 400);
    }

    public function ozowReturn(Request $request): JsonResponse
    {
        $paymentId = $request->input('transactionReference');
        $payment = Payment::find($paymentId);

        return response()->json([
            'status' => 'returned',
            'payment_status' => $payment?->status ?? 'unknown',
        ]);
    }

    public function refund(Request $request, Payment $payment): JsonResponse
    {
        $user = $request->user();
        if (!$user->hasRole('admin')) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'reason' => 'required|string|in:admin_override,driver_no_show,duplicate_charge,technical_issue',
            'description' => 'nullable|string|max:500',
        ]);

        $result = $this->refundService->processRefund(
            $payment->ride,
            $validated['reason'],
            $user->id,
        );

        if (!$result['success']) {
            return response()->json($result, 422);
        }

        return response()->json($result);
    }

    public function dispute(Request $request, Payment $payment): JsonResponse
    {
        if ($payment->payer_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if (!$this->escrowService->isWithinDisputeWindow($payment->ride)) {
            return response()->json(['message' => 'Dispute window has expired (24 hours after ride completion).'], 422);
        }

        if ($payment->dispute) {
            return response()->json(['message' => 'A dispute already exists for this payment.'], 422);
        }

        $validated = $request->validate([
            'reason' => 'required|string|max:100',
            'description' => 'required|string|max:1000',
        ]);

        \App\Models\Dispute::create([
            'ride_id' => $payment->ride_id,
            'payment_id' => $payment->id,
            'raised_by' => $request->user()->id,
            'reason' => $validated['reason'],
            'description' => $validated['description'],
        ]);

        $this->escrowService->holdPendingFundsForDispute($payment);

        return response()->json(['message' => 'Dispute raised successfully.'], 201);
    }

    private function checkPaymentVelocity(string $userId, float $rideAmount): ?array
    {
        $windowStart = now()->subHour();

        $recentCount = Payment::where('payer_id', $userId)
            ->where('created_at', '>=', $windowStart)
            ->count();

        if ($recentCount >= 5) {
            return [
                'code' => 'VELOCITY_COUNT_EXCEEDED',
                'message' => 'Too many payments in the last hour. Please try again later.',
            ];
        }

        $recentAmount = (float) Payment::where('payer_id', $userId)
            ->where('created_at', '>=', $windowStart)
            ->whereIn('status', [Payment::STATUS_PAID, Payment::STATUS_ESCROW_HELD, Payment::STATUS_PENDING])
            ->sum('amount');

        $hourlyLimit = (float) config('easyryde.payment.velocity.hourly_limit', 5000.00);
        if (($recentAmount + $rideAmount) > $hourlyLimit) {
            return [
                'code' => 'VELOCITY_AMOUNT_EXCEEDED',
                'message' => 'Hourly payment limit exceeded. Please contact support.',
            ];
        }

        return null;
    }
}

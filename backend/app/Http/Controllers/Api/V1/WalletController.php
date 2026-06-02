<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use App\Services\OzowService;
use App\Services\PayFastService;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    public function __construct(
        protected WalletService $walletService,
        protected PayFastService $payFastService,
        protected OzowService $ozowService,
    ) {}

    public function show(Request $request): JsonResponse
    {
        $wallet = $this->walletService->getOrCreateWallet($request->user());

        return response()->json([
            'id' => $wallet->id,
            'balance' => (float) $wallet->balance,
            'pending_balance' => (float) $wallet->pending_balance,
            'currency' => $wallet->currency,
        ]);
    }

    public function transactions(Request $request): JsonResponse
    {
        $wallet = Wallet::where('user_id', $request->user()->id)->first();

        if (!$wallet) {
            return response()->json(['data' => [], 'meta' => ['total' => 0]]);
        }

        $transactions = $wallet->transactions()
            ->when($request->type, fn ($q, $v) => $q->where('type', $v))
            ->latest()
            ->paginate($request->per_page ?? 15);

        return response()->json($transactions);
    }

    public function deposit(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1|max:50000',
            'payment_method' => 'required|string|in:payfast,ozow',
            'return_url' => 'nullable|string|url',
            'cancel_url' => 'nullable|string|url',
        ]);

        $user = $request->user();
        $wallet = $this->walletService->getOrCreateWallet($user);
        $amount = (float) $validated['amount'];
        $method = $validated['payment_method'];

        $transaction = $this->walletService->credit(
            $wallet,
            $amount,
            'deposit',
            $wallet->id,
            "Wallet deposit via {$method} (pending gateway confirmation)",
        );

        if ($method === 'payfast') {
            $url = $this->payFastService->generatePaymentUrl([
                'payment_id' => $transaction->id,
                'amount' => $amount,
                'item_name' => 'EasyRyde Wallet Top-Up',
                'item_description' => "Top up wallet with R{$amount}",
                'name_first' => $user->name ?? '',
                'email' => $user->email ?? '',
            ]);

            return response()->json([
                'transaction' => $transaction,
                'redirect_url' => $url,
                'message' => 'Redirect to PayFast to complete deposit.',
            ], 201);
        }

        if ($method === 'ozow') {
            $result = $this->ozowService->createPayment([
                'amount' => $amount,
                'transaction_reference' => $transaction->id,
                'bank_reference' => 'EASYRYDE-TOPUP',
                'customer' => [
                    'name' => $user->name ?? '',
                    'email' => $user->email ?? '',
                    'phone' => $user->phone_number ?? '',
                ],
            ]);

            if (!$result['success']) {
                return response()->json(['message' => $result['error'] ?? 'Ozow payment failed.'], 502);
            }

            return response()->json([
                'transaction' => $transaction,
                'redirect_url' => $result['url'],
                'message' => 'Redirect to Ozow to complete deposit.',
            ], 201);
        }

        return response()->json(['message' => 'Invalid payment method.'], 422);
    }

    public function withdraw(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:50|max:50000',
        ]);

        $wallet = $this->walletService->getOrCreateWallet($request->user());

        if (!$this->walletService->hasSufficientFunds($wallet, (float) $validated['amount'])) {
            return response()->json([
                'message' => 'Insufficient balance.',
                'balance' => (float) $wallet->balance,
                'requested' => (float) $validated['amount'],
            ], 422);
        }

        $transaction = $this->walletService->debit(
            $wallet,
            (float) $validated['amount'],
            'withdrawal',
            $wallet->id,
            'Wallet withdrawal (pending admin approval)',
        );

        return response()->json([
            'transaction' => $transaction,
            'message' => 'Withdrawal request submitted for admin approval.',
            'wallet' => [
                'balance' => (float) $wallet->fresh()->balance,
                'currency' => $wallet->currency,
            ],
        ], 201);
    }
}

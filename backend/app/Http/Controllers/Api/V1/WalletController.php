<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    public function __construct(
        protected WalletService $walletService,
    ) {}

    public function show(Request $request): JsonResponse
    {
        $wallet = Wallet::firstOrCreate(
            ['user_id' => $request->user()->id],
            ['balance' => 0, 'pending_balance' => 0, 'currency' => 'USD'],
        );

        return response()->json($wallet->load('user'));
    }

    public function transactions(Request $request): JsonResponse
    {
        $wallet = Wallet::where('user_id', $request->user()->id)->first();

        if (!$wallet) {
            return response()->json(['data' => [], 'total' => 0]);
        }

        $transactions = $wallet->transactions()
            ->when($request->type, fn($q, $v) => $q->where('type', $v))
            ->latest()
            ->paginate($request->per_page ?? 15);

        return response()->json($transactions);
    }

    public function deposit(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|string',
            'description' => 'nullable|string|max:255',
        ]);

        $wallet = Wallet::firstOrCreate(
            ['user_id' => $request->user()->id],
            ['balance' => 0, 'pending_balance' => 0, 'currency' => 'USD'],
        );

        $transaction = $wallet->transactions()->create([
            'type' => 'deposit',
            'amount' => $validated['amount'],
            'balance_before' => $wallet->balance,
            'balance_after' => $wallet->balance + $validated['amount'],
            'description' => $validated['description'] ?? 'Wallet deposit',
        ]);

        $wallet->increment('balance', $validated['amount']);

        return response()->json($transaction, 201);
    }

    public function withdraw(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string|max:255',
        ]);

        $wallet = Wallet::where('user_id', $request->user()->id)->first();

        if (!$wallet || $wallet->balance < $validated['amount']) {
            return response()->json(['message' => 'Insufficient balance.'], 422);
        }

        $transaction = $wallet->transactions()->create([
            'type' => 'withdrawal',
            'amount' => -$validated['amount'],
            'balance_before' => $wallet->balance,
            'balance_after' => $wallet->balance - $validated['amount'],
            'description' => $validated['description'] ?? 'Wallet withdrawal',
        ]);

        $wallet->decrement('balance', $validated['amount']);

        return response()->json($transaction, 201);
    }
}

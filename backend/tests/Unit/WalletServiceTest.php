<?php

namespace Tests\Unit;

use App\Models\User;
use App\Models\WalletTransaction;
use App\Services\WalletService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WalletServiceTest extends TestCase
{
    use RefreshDatabase;

    private WalletService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new WalletService;
    }

    public function test_get_or_create_wallet_creates_wallet(): void
    {
        $user = User::factory()->create();
        $wallet = $this->service->getOrCreateWallet($user);

        $this->assertNotNull($wallet);
        $this->assertEquals($user->id, $wallet->user_id);
        $this->assertEquals(0.0, $wallet->balance);
    }

    public function test_get_or_create_wallet_returns_existing(): void
    {
        $user = User::factory()->create();
        $wallet1 = $this->service->getOrCreateWallet($user);
        $wallet2 = $this->service->getOrCreateWallet($user);

        $this->assertEquals($wallet1->id, $wallet2->id);
    }

    public function test_credit_increases_balance(): void
    {
        $user = User::factory()->create();
        $wallet = $this->service->getOrCreateWallet($user);

        $this->service->credit($wallet, 100.0, 'test', 'ref-1', 'Test credit');
        $wallet->refresh();

        $this->assertEquals(100.0, $wallet->balance);
    }

    public function test_debit_decreases_balance(): void
    {
        $user = User::factory()->create();
        $wallet = $this->service->getOrCreateWallet($user);

        $this->service->credit($wallet, 100.0, 'test', 'ref-1', 'Initial');
        $this->service->debit($wallet, 40.0, 'test', 'ref-2', 'Test debit');
        $wallet->refresh();

        $this->assertEquals(60.0, $wallet->balance);
    }

    public function test_get_balance(): void
    {
        $user = User::factory()->create();
        $wallet = $this->service->getOrCreateWallet($user);
        $this->service->credit($wallet, 250.0, 'test', 'ref-1', 'Test');

        $balance = $this->service->getBalance($wallet);

        $this->assertEquals(250.0, $balance);
    }

    public function test_has_sufficient_funds(): void
    {
        $user = User::factory()->create();
        $wallet = $this->service->getOrCreateWallet($user);
        $this->service->credit($wallet, 100.0, 'test', 'ref-1', 'Test');

        $this->assertTrue($this->service->hasSufficientFunds($wallet, 50.0));
        $this->assertFalse($this->service->hasSufficientFunds($wallet, 150.0));
    }

    public function test_transaction_history_recorded(): void
    {
        $user = User::factory()->create();
        $wallet = $this->service->getOrCreateWallet($user);
        $this->service->credit($wallet, 100.0, 'test', 'ref-1', 'Credit 1');
        $this->service->debit($wallet, 30.0, 'test', 'ref-2', 'Debit 1');

        $transactions = WalletTransaction::where('wallet_id', $wallet->id)->get();

        $this->assertCount(2, $transactions);
        $this->assertEquals('credit', $transactions[0]->type);
        $this->assertEquals('debit', $transactions[1]->type);
    }
}

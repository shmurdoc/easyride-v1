<?php

namespace Tests\Unit;

use App\Models\Payment;
use App\Models\Ride;
use App\Models\Tenant;
use App\Models\User;
use App\Services\PaymentService;
use App\Services\WalletService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class PaymentServiceTest extends TestCase
{
    use RefreshDatabase;

    private PaymentService $service;

    private WalletService $walletService;

    private Tenant $tenant;

    protected function setUp(): void
    {
        parent::setUp();
        Role::create(['name' => 'rider', 'guard_name' => 'web']);
        Role::create(['name' => 'driver', 'guard_name' => 'web']);
        Role::create(['name' => 'admin', 'guard_name' => 'web']);
        $this->tenant = Tenant::factory()->create();
        $this->walletService = new WalletService;
        $this->service = new PaymentService($this->walletService);
    }

    public function test_process_payment_creates_record(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        $wallet = $this->walletService->getOrCreateWallet($rider);
        $this->walletService->credit($wallet, 500.0, 'test', 'ref-1', 'Initial deposit');

        $ride = Ride::create([
            'rider_id' => $rider->id,
            'tenant_id' => $this->tenant->id,
            'status' => 'completed',
            'category' => 'standard',
            'pickup_latitude' => -23.9468,
            'pickup_longitude' => 29.4726,
            'pickup_address' => '123 Main St',
            'dropoff_latitude' => -23.9500,
            'dropoff_longitude' => 29.4800,
            'dropoff_address' => '456 Oak Ave',
            'total_fare' => 150.00,
        ]);

        $payment = $this->service->processPayment($ride, 'wallet');

        $this->assertNotNull($payment);
        $this->assertEquals(150.00, $payment->amount);
        $this->assertEquals('wallet', $payment->method);
        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'amount' => 150.00,
            'ride_id' => $ride->id,
        ]);
    }

    public function test_cash_payment_creates_record(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');

        $ride = Ride::create([
            'rider_id' => $rider->id,
            'tenant_id' => $this->tenant->id,
            'status' => 'completed',
            'category' => 'standard',
            'pickup_latitude' => -23.9468,
            'pickup_longitude' => 29.4726,
            'pickup_address' => '123 Main St',
            'dropoff_latitude' => -23.9500,
            'dropoff_longitude' => 29.4800,
            'dropoff_address' => '456 Oak Ave',
            'total_fare' => 150.00,
        ]);

        $payment = $this->service->processPayment($ride, 'cash');

        $this->assertNotNull($payment);
        $this->assertEquals('cash', $payment->method);
        $this->assertEquals(Payment::STATUS_COMPLETED, $payment->status);
    }

    public function test_process_refund_updates_status(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        $wallet = $this->walletService->getOrCreateWallet($rider);
        $this->walletService->credit($wallet, 500.0, 'test', 'ref-1', 'Initial');

        $ride = Ride::create([
            'rider_id' => $rider->id,
            'tenant_id' => $this->tenant->id,
            'status' => 'completed',
            'category' => 'standard',
            'pickup_latitude' => -23.9468,
            'pickup_longitude' => 29.4726,
            'pickup_address' => '123 Main St',
            'dropoff_latitude' => -23.9500,
            'dropoff_longitude' => 29.4800,
            'dropoff_address' => '456 Oak Ave',
            'total_fare' => 200.00,
        ]);

        $payment = $this->service->processPayment($ride, 'wallet');
        $refund = $this->service->processRefund($payment, 'Duplicate charge');

        $this->assertNotNull($refund);
        $this->assertEquals(Payment::STATUS_REFUNDED, $refund->status);
    }

    public function test_platform_fee_calculated(): void
    {
        $fee = $this->service->calculatePlatformFee(100.0);
        $this->assertEquals(15.0, $fee);

        $fee2 = $this->service->calculatePlatformFee(200.0);
        $this->assertEquals(30.0, $fee2);
    }
}

<?php

namespace Tests\Unit\Jobs;

use App\Jobs\ProcessPaymentJob;
use App\Models\Payment;
use App\Models\Ride;
use App\Models\User;
use App\Services\PaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class ProcessPaymentJobTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Role::create(['name' => 'rider', 'guard_name' => 'web']);
        Role::create(['name' => 'driver', 'guard_name' => 'web']);
    }

    public function test_job_dispatches_on_horizon_queue(): void
    {
        Bus::fake();

        $rider = User::factory()->create();
        $rider->assignRole('rider');
        $ride = Ride::factory()->create(['rider_id' => $rider->id]);

        $payment = Payment::factory()->create([
            'ride_id' => $ride->id,
            'payer_id' => $rider->id,
        ]);

        ProcessPaymentJob::dispatch($ride, $payment);

        Bus::assertDispatched(ProcessPaymentJob::class);
    }

    public function test_queue_is_horizon(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        $ride = Ride::factory()->create(['rider_id' => $rider->id]);
        $payment = Payment::factory()->create([
            'ride_id' => $ride->id,
            'payer_id' => $rider->id,
        ]);

        $job = new ProcessPaymentJob($ride, $payment);

        $this->assertEquals('horizon', $job->queue);
    }

    public function test_handle_calls_process_payment(): void
    {
        $rider = User::factory()->create();
        $rider->assignRole('rider');
        $ride = Ride::factory()->create(['rider_id' => $rider->id]);
        $payment = Payment::factory()->create([
            'ride_id' => $ride->id,
            'payer_id' => $rider->id,
        ]);

        $service = $this->createMock(PaymentService::class);
        $service->expects($this->once())
            ->method('processPayment')
            ->with($ride, $payment);

        $job = new ProcessPaymentJob($ride, $payment);
        $job->handle($service);
    }
}

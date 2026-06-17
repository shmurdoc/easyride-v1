<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\CashPaymentService;
use App\Services\EscrowService;
use App\Services\SettlementService;
use Illuminate\Console\Command;

class ProcessPayments extends Command
{
    protected $signature = 'payments:process {--type=all : Type of processing (escrow|payouts|reconciliation|all)}';

    protected $description = 'Process payment operations: escrow release, driver payouts, cash reconciliation';

    public function handle(
        EscrowService $escrowService,
        SettlementService $settlementService,
        CashPaymentService $cashPaymentService,
    ): int {
        $type = $this->option('type');

        if ($type === 'all' || $type === 'escrow') {
            $this->info('Releasing escrow payments...');
            $released = $escrowService->releaseCompletedRides();
            $this->info("Released {$released} escrow payments.");
        }

        if ($type === 'all' || $type === 'payouts') {
            $this->info('Processing driver payouts...');
            $result = $settlementService->processDriverPayouts();
            $this->info("Processed {$result['processed']} payouts, total R{$result['total']}, {$result['errors']} errors.");
        }

        if ($type === 'all' || $type === 'reconciliation') {
            $this->info('Processing cash reconciliation...');
            $result = $cashPaymentService->reconcileOutstanding();
            $this->info("Reconciled {$result['count']} cash payments, total R{$result['total']}.");
        }

        return self::SUCCESS;
    }
}

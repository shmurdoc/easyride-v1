<?php

namespace App\Console\Commands;

use App\Services\Payment\PayoutService;
use Illuminate\Console\Command;

class ProcessDriverPayouts extends Command
{
    protected $signature = 'payouts:process {--type=daily : daily or weekly}';

    protected $description = 'Process driver payouts (daily for balances > R200, weekly for balances <= R200)';

    public function handle(PayoutService $payoutService): void
    {
        $type = $this->option('type');
        $count = $type === 'weekly'
            ? $payoutService->processWeeklyPayouts()
            : $payoutService->processDailyPayouts();
        $this->info("Processed {$count} {$type} payouts.");
    }
}

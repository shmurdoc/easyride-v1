<?php

namespace App\Jobs;

use App\Models\DriverPayout;
use App\Models\Wallet;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ProcessPayoutJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 3600;

    public function __construct(public DriverPayout $payout) {}

    public function handle(): void
    {
        try {
            $this->payout->update(['status' => 'processing']);

            Wallet::where('user_id', $this->payout->driver_id)
                ->decrement('balance', $this->payout->amount);

            $this->payout->update([
                'status' => 'completed',
                'reference' => 'PAY-'.strtoupper(Str::random(12)),
                'processed_at' => now(),
            ]);

            Log::info('Payout completed', ['payout_id' => $this->payout->id, 'driver_id' => $this->payout->driver_id]);
        } catch (\Exception $e) {
            Log::error('Payout failed', [
                'payout_id' => $this->payout->id,
                'error' => $e->getMessage(),
            ]);
            if ($this->attempts() >= $this->tries) {
                $this->payout->update(['status' => 'failed', 'notes' => $e->getMessage()]);
            }
            throw $e;
        }
    }
}

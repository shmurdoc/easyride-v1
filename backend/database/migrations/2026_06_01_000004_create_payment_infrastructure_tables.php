<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cash_reconciliations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('payment_id')->constrained('payments')->cascadeOnDelete();
            $table->foreignUuid('ride_id')->constrained('rides')->cascadeOnDelete();
            $table->foreignUuid('driver_id')->nullable()->constrained('users')->nullOnDelete();
            $table->decimal('expected_amount', 10, 2);
            $table->decimal('platform_fee', 10, 2)->default(0);
            $table->decimal('actual_amount', 10, 2)->nullable();
            $table->decimal('discrepancy', 10, 2)->default(0);
            $table->string('status')->default('pending');
            $table->timestamp('settled_at')->nullable();
            $table->string('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('driver_payouts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('driver_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('amount', 10, 2);
            $table->decimal('balance_before', 10, 2)->default(0);
            $table->decimal('balance_after', 10, 2)->default(0);
            $table->string('status')->default('pending');
            $table->string('payout_method')->default('bank_transfer');
            $table->string('gateway_reference')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->string('failure_reason')->nullable();
            $table->timestamps();

            $table->index('driver_id');
            $table->index('status');
        });

        Schema::create('disputes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('ride_id')->constrained('rides')->cascadeOnDelete();
            $table->foreignUuid('payment_id')->constrained('payments')->cascadeOnDelete();
            $table->foreignUuid('raised_by')->constrained('users')->cascadeOnDelete();
            $table->string('reason');
            $table->text('description')->nullable();
            $table->string('status')->default('open');
            $table->foreignUuid('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('resolved_at')->nullable();
            $table->string('resolution')->nullable();
            $table->timestamps();
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->foreignUuid('payee_id')->nullable()->after('payer_id')->constrained('users')->nullOnDelete();
            $table->decimal('driver_payout', 10, 2)->nullable()->after('platform_fee');
            $table->decimal('refund_amount', 10, 2)->nullable()->after('refund_reason');
            $table->foreignUuid('refunded_by')->nullable()->after('refund_amount')->constrained('users')->nullOnDelete();
            $table->boolean('escrow_released')->default(false)->after('refunded_by');
            $table->timestamp('escrow_released_at')->nullable()->after('escrow_released');
            $table->boolean('dispute_hold')->default(false)->after('escrow_released_at');
            $table->decimal('dispute_hold_shortfall', 10, 2)->nullable()->after('dispute_hold');
            $table->decimal('cash_received', 10, 2')->nullable()->after('dispute_hold_shortfall');
            $table->decimal('cash_discrepancy', 10, 2)->nullable()->after('cash_received');
            $table->timestamp('cash_settled_at')->nullable()->after('cash_discrepancy');
            $table->boolean('cash_reconciled')->default(false)->after('cash_settled_at');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn([
                'payee_id', 'driver_payout', 'refund_amount', 'refunded_by',
                'escrow_released', 'escrow_released_at', 'dispute_hold', 'dispute_hold_shortfall',
                'cash_received', 'cash_discrepancy', 'cash_settled_at', 'cash_reconciled',
            ]);
        });

        Schema::dropIfExists('disputes');
        Schema::dropIfExists('driver_payouts');
        Schema::dropIfExists('cash_reconciliations');
    }
};

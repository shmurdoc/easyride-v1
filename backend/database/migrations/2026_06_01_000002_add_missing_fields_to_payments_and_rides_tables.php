<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->uuid('payee_id')->nullable()->after('payer_id');
            $table->decimal('driver_payout', 10, 2)->nullable()->after('platform_fee');
            $table->timestamp('refunded_at')->nullable()->after('paid_at');
            $table->text('refund_reason')->nullable()->after('refunded_at');

            $table->foreign('payee_id')->references('id')->on('users')->onDelete('set null');
        });

        Schema::table('rides', function (Blueprint $table) {
            $table->uuid('promo_code_id')->nullable()->after('surge_multiplier');
            $table->decimal('discount_amount', 10, 2)->nullable()->after('promo_code_id');
            $table->string('payment_method', 30)->nullable()->after('discount_amount');
            $table->string('payment_status', 30)->nullable()->after('payment_method');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['payee_id']);
            $table->dropColumn(['payee_id', 'driver_payout', 'refunded_at', 'refund_reason']);
        });

        Schema::table('rides', function (Blueprint $table) {
            $table->dropColumn(['promo_code_id', 'discount_amount', 'payment_method', 'payment_status']);
        });
    }
};

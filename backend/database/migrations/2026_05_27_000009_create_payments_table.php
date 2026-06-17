<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('ride_id')->nullable();
            $table->uuid('payer_id');
            $table->string('method', 30);
            $table->string('gateway', 30)->nullable();
            $table->string('gateway_reference')->nullable();
            $table->decimal('amount', 12, 2);
            $table->decimal('platform_fee', 10, 2)->default(0.00);
            $table->string('status', 30)->default('pending');
            $table->string('currency', 3)->default('ZAR');
            $table->json('gateway_response')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->foreign('ride_id')->references('id')->on('rides')->nullOnDelete();
            $table->foreign('payer_id')->references('id')->on('users')->onDelete('cascade');
            $table->index('status');
            $table->index(['gateway', 'gateway_reference']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};

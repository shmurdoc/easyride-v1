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
            $table->foreignUuid('ride_id')->constrained('rides');
            $table->foreignUuid('driver_id')->constrained('users');
            $table->foreignUuid('rider_id')->constrained('users');
            $table->decimal('fare_amount', 10, 2);
            $table->decimal('platform_fee', 10, 2);
            $table->decimal('driver_earns', 10, 2);
            $table->timestamp('driver_marked_at');
            $table->timestamp('admin_reconciled_at')->nullable();
            $table->string('status')->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_reconciliations');
    }
};

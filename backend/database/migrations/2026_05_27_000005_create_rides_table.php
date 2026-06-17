<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rides', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->nullable();
            $table->uuid('rider_id');
            $table->uuid('driver_id')->nullable();
            $table->decimal('pickup_latitude', 10, 7);
            $table->decimal('pickup_longitude', 10, 7);
            $table->decimal('dropoff_latitude', 10, 7)->nullable();
            $table->decimal('dropoff_longitude', 10, 7)->nullable();
            $table->string('pickup_address')->nullable();
            $table->string('dropoff_address')->nullable();
            $table->string('status', 30)->default('searching');
            $table->string('category', 50)->default('standard');
            $table->decimal('distance_km', 8, 3)->nullable();
            $table->decimal('duration_minutes', 6, 1)->nullable();
            $table->decimal('base_fare', 10, 2)->nullable();
            $table->decimal('per_km_fare', 10, 2)->nullable();
            $table->decimal('surge_multiplier', 4, 2)->default(1.00);
            $table->decimal('total_fare', 10, 2)->nullable();
            $table->integer('driver_eta')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->string('cancelled_by', 20)->nullable();
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('rider_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('driver_id')->references('id')->on('users')->onDelete('set null');
            $table->index('status');
            $table->index(['tenant_id', 'status']);
            $table->index(['driver_id', 'status']);
            $table->index(['rider_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rides');
    }
};

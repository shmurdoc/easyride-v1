<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('delivery_proofs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('delivery_id')->constrained('deliveries')->cascadeOnDelete();
            $table->foreignUuid('driver_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('proof_type')->default('photo');
            $table->string('file_path')->nullable();
            $table->string('signature_path')->nullable();
            $table->text('notes')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->timestamp('captured_at')->nullable();
            $table->timestamps();

            $table->index('delivery_id');
        });

        Schema::create('scheduled_rides', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('rider_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('driver_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('category')->default('standard');
            $table->decimal('pickup_latitude', 10, 7);
            $table->decimal('pickup_longitude', 10, 7);
            $table->string('pickup_address');
            $table->decimal('dropoff_latitude', 10, 7);
            $table->decimal('dropoff_longitude', 10, 7);
            $table->string('dropoff_address');
            $table->timestamp('scheduled_at');
            $table->string('status')->default('pending');
            $table->string('recurrence')->nullable();
            $table->decimal('estimated_fare', 10, 2)->nullable();
            $table->foreignUuid('ride_id')->nullable()->constrained('rides')->nullOnDelete();
            $table->timestamps();

            $table->index('rider_id');
            $table->index('scheduled_at');
            $table->index('status');
        });

        Schema::create('referral_codes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('code')->unique();
            $table->integer('usage_count')->default(0);
            $table->integer('max_uses')->default(50);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('code');
        });

        Schema::create('referral_redemptions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('referral_code_id')->constrained('referral_codes')->cascadeOnDelete();
            $table->foreignUuid('referrer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('referred_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('bonus_amount', 10, 2)->default(25.00);
            $table->boolean('bonus_paid')->default(false);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index('referrer_id');
            $table->index('referred_id');
        });

        Schema::create('sos_alerts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('ride_id')->nullable()->constrained('rides')->nullOnDelete();
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->text('location_description')->nullable();
            $table->string('status')->default('active');
            $table->string('severity')->default('high');
            $table->foreignUuid('acknowledged_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('acknowledged_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('status');
        });

        Schema::create('ride_chat_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('ride_id')->constrained('rides')->cascadeOnDelete();
            $table->foreignUuid('sender_id')->constrained('users')->cascadeOnDelete();
            $table->text('message');
            $table->boolean('is_system')->default(false);
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index('ride_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ride_chat_messages');
        Schema::dropIfExists('sos_alerts');
        Schema::dropIfExists('referral_redemptions');
        Schema::dropIfExists('referral_codes');
        Schema::dropIfExists('scheduled_rides');
        Schema::dropIfExists('delivery_proofs');
    }
};

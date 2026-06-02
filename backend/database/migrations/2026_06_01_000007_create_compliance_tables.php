<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consent_records', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('consent_type');
            $table->string('consent_version');
            $table->timestamp('granted_at');
            $table->timestamp('revoked_at')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'consent_type']);
        });

        Schema::create('kyc_verifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('verification_type');
            $table->string('document_type');
            $table->string('document_number');
            $table->string('document_front_path')->nullable();
            $table->string('document_back_path')->nullable();
            $table->string('selfie_path')->nullable();
            $table->enum('status', ['pending', 'under_review', 'approved', 'rejected', 'expired'])->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->foreignUuid('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('expires_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['status', 'created_at']);
        });

        Schema::create('incident_reports', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('reporter_id')->constrained('users');
            $table->foreignUuid('ride_id')->nullable()->constrained('rides')->nullOnDelete();
            $table->foreignUuid('delivery_id')->nullable()->constrained('deliveries')->nullOnDelete();
            $table->string('incident_type');
            $table->enum('severity', ['low', 'medium', 'high', 'critical']);
            $table->string('title');
            $table->text('description');
            $table->enum('status', ['open', 'investigating', 'resolved', 'closed', 'escalated'])->default('open');
            $table->foreignUuid('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->text('resolution')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->json('evidence_paths')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['status', 'severity']);
            $table->index(['reporter_id', 'created_at']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_kyc_verified')->default(false);
            $table->timestamp('kyc_verified_at')->nullable();
            $table->timestamp('anonymized_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('incident_reports');
        Schema::dropIfExists('kyc_verifications');
        Schema::dropIfExists('consent_records');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['is_kyc_verified', 'kyc_verified_at', 'anonymized_at']);
        });
    }
};

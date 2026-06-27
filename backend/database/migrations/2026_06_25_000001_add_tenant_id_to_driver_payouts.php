<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('driver_payouts', function (Blueprint $table) {
            $table->foreignUuid('tenant_id')->nullable()->after('id')->constrained('tenants');
        });

        // Backfill tenant_id from driver's tenant
        DB::statement('
            UPDATE driver_payouts
            SET tenant_id = (SELECT tenant_id FROM users WHERE users.id = driver_payouts.driver_id)
            WHERE tenant_id IS NULL
        ');

        // Make tenant_id non-nullable after backfill
        Schema::table('driver_payouts', function (Blueprint $table) {
            $table->foreignUuid('tenant_id')->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('driver_payouts', function (Blueprint $table) {
            $table->dropForeign(['tenant_id']);
            $table->dropColumn('tenant_id');
        });
    }
};

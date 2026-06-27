<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('wallets', function (Blueprint $table) {
            $table->uuid('tenant_id')->nullable()->after('user_id');
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->index('tenant_id');
        });

        if (Schema::hasColumn('rides', 'cancelled_by')) {
            $driver = DB::connection()->getDriverName();
            if ($driver === 'pgsql') {
                DB::statement('ALTER TABLE rides DROP CONSTRAINT IF EXISTS rides_cancelled_by_check');
                DB::statement('ALTER TABLE rides ALTER COLUMN cancelled_by TYPE VARCHAR(40) USING cancelled_by::varchar');
                DB::statement('ALTER TABLE rides ALTER COLUMN cancelled_by DROP NOT NULL');
            }
        }
    }

    public function down(): void
    {
        Schema::table('wallets', function (Blueprint $table) {
            $table->dropForeign(['tenant_id']);
            $table->dropColumn('tenant_id');
        });

        if (Schema::hasColumn('rides', 'cancelled_by')) {
            $driver = DB::connection()->getDriverName();
            if ($driver === 'pgsql') {
                DB::statement('ALTER TABLE rides ALTER COLUMN cancelled_by TYPE VARCHAR(20)');
            }
        }
    }
};

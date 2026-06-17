<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rides', function (Blueprint $table) {
            $table->text('route_polyline')->nullable()->after('duration_minutes');
            $table->string('cancellation_reason', 50)->nullable()->after('cancelled_by');
        });
    }

    public function down(): void
    {
        Schema::table('rides', function (Blueprint $table) {
            $table->dropColumn(['route_polyline', 'cancellation_reason']);
        });
    }
};

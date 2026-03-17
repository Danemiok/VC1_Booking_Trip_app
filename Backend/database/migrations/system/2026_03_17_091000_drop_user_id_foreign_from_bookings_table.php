<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('bookings')) {
            return;
        }

        // Best-effort: only applies on DBs that support dropping FKs (e.g. MySQL).
        try {
            Schema::table('bookings', function (Blueprint $table) {
                $table->dropForeign(['user_id']);
            });
        } catch (\Throwable $e) {
            // ignore
        }
    }

    public function down(): void
    {
        // No-op (re-adding FK is environment-specific and not required for this app flow).
    }
};


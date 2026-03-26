<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('booking_history')) {
            return;
        }

        Schema::table('booking_history', function (Blueprint $table) {
            if (! Schema::hasColumn('booking_history', 'customer_name')) {
                $table->string('customer_name', 255)->nullable()->after('created_at');
            }
            if (! Schema::hasColumn('booking_history', 'customer_email')) {
                $table->string('customer_email', 255)->nullable()->after('customer_name');
            }
        });
    }

    public function down(): void
    {
        // Non-destructive down.
    }
};


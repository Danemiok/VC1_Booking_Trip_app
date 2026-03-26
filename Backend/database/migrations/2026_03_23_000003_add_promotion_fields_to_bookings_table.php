<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // Add promotion tracking fields
            if (!Schema::hasColumn('bookings', 'promotion_id')) {
                $table->unsignedBigInteger('promotion_id')->nullable()->after('transport_id');
            }
            if (!Schema::hasColumn('bookings', 'original_amount')) {
                $table->decimal('original_amount', 10, 2)->nullable()->comment('Price before promotion discount')->after('amount');
            }
            if (!Schema::hasColumn('bookings', 'discounted_amount')) {
                $table->decimal('discounted_amount', 10, 2)->nullable()->comment('Discount amount applied')->after('original_amount');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            if (Schema::hasColumn('bookings', 'promotion_id')) {
                $table->dropColumn('promotion_id');
            }
            if (Schema::hasColumn('bookings', 'original_amount')) {
                $table->dropColumn('original_amount');
            }
            if (Schema::hasColumn('bookings', 'discounted_amount')) {
                $table->dropColumn('discounted_amount');
            }
        });
    }
};

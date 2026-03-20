<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('booking_history')) {
            return;
        }

        Schema::create('booking_history', function (Blueprint $table) {
            $table->increments('id');

            // Note: frontend booking codes look like "BK-<timestamp>-xxxx".
            // Store a safe numeric token in booking_id and keep the full code in booking_code.
            $table->unsignedBigInteger('booking_id')->nullable();
            $table->unsignedBigInteger('user_id')->index();

            $table->string('booking_code', 50)->index();
            $table->string('destination', 255)->nullable();
            $table->string('travel_date', 100)->nullable();
            $table->unsignedInteger('travelers')->default(0);
            $table->decimal('amount', 10, 2)->default(0);
            $table->string('status', 50)->default('pending');

            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_history');
    }
};


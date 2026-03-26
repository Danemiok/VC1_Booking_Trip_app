<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('notifications')) {
            return;
        }

        Schema::create('notifications', function (Blueprint $table) {
            $table->bigIncrements('id');

            $table->unsignedBigInteger('user_id');
            // The user requested BIGINT, but bookings.id is a string in this repo.
            // We'll store a numeric booking token (e.g. extracted from "BK-<digits>-...") for compatibility.
            $table->unsignedBigInteger('booking_id')->nullable()->index();

            $table->string('type', 50)->default('new_booking')->index();
            $table->string('title');
            $table->text('message')->nullable();

            $table->boolean('is_read')->default(false)->index();
            $table->json('data')->nullable();

            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index(['user_id', 'is_read']);
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};

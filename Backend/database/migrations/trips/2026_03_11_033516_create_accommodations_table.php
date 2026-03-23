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
        if (!Schema::hasTable('accommodations')) {
            Schema::create('accommodations', function (Blueprint $table) {
                $table->id();

                $table->unsignedBigInteger('destination_id');
                $table->string('name');
                $table->string('type')->default('Hotel');
                $table->text('description')->nullable();
                $table->integer('capacity');
                $table->decimal('price_per_night', 10, 2);
                $table->string('image')->nullable();
                $table->decimal('rating', 3, 1)->default(0);
                $table->enum('status', ['available', 'booked'])->default('available');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('destinations') || !Schema::hasColumn('accommodations', 'destination_id')) {
            return;
        }

        try {
            Schema::table('accommodations', function (Blueprint $table) {
                $table->foreign('destination_id')
                    ->references('id')
                    ->on('destinations')
                    ->onDelete('cascade');
            });
        } catch (\Throwable $e) {
            // Ignore if the constraint already exists or cannot be created in this environment.
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accommodations');
    }
};

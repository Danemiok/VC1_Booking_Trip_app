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
        Schema::create('destinations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('type')->default('Boutique Hotel');
            $table->text('description')->nullable();
            $table->string('location');
            $table->text('address')->nullable();
            $table->decimal('price', 10, 2);
            $table->string('image')->nullable();
            $table->json('images')->nullable();
            $table->decimal('rating', 3, 1)->default(0);
            $table->integer('total_bookings')->default(0);
            $table->enum('status', ['draft', 'active'])->default('draft');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('destinations');
    }
};

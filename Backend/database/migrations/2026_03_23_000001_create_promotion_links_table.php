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
        Schema::create('promotion_links', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('promotion_id');
            $table->string('link_type'); // 'destination' or 'transport'
            $table->unsignedBigInteger('link_id'); // destination_id or transport_id
            $table->timestamps();
            
            // Foreign key constraints
            $table->foreign('promotion_id')->references('id')->on('promotions')->onDelete('cascade');
            
            // Indexes for faster queries
            $table->index(['promotion_id', 'link_type', 'link_id']);
            $table->index(['link_type', 'link_id']);
            
            // Prevent duplicate links
            $table->unique(['promotion_id', 'link_type', 'link_id'], 'unique_promotion_link');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promotion_links');
    }
};

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
        // Check if promotions table exists with different schema
        if (Schema::hasTable('promotions')) {
            // Add owner_id column if it doesn't exist (for existing tables)
            if (!Schema::hasColumn('promotions', 'owner_id')) {
                Schema::table('promotions', function (Blueprint $table) {
                    $table->unsignedBigInteger('owner_id')->nullable()->after('id');
                });
            }
            return;
        }

        // Create new table if it doesn't exist
        Schema::create('promotions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('owner_id')->nullable();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('discount');
            $table->string('type');
            $table->string('image')->nullable();
            $table->date('expiry')->nullable();
            $table->string('code')->nullable();
            $table->string('color')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promotions');
    }
};


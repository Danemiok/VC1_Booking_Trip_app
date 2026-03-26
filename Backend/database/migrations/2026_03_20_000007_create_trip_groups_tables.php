<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('trip_groups')) {
            Schema::create('trip_groups', function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->string('access_code', 12)->unique();
                $table->string('name', 255)->nullable();
                $table->unsignedBigInteger('created_by')->index();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('trip_group_members')) {
            Schema::create('trip_group_members', function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->unsignedBigInteger('group_id')->index();
                $table->unsignedBigInteger('user_id')->index();
                $table->string('user_email', 255)->nullable();
                $table->string('user_name', 255)->nullable();
                $table->enum('role', ['Leader', 'Member'])->default('Member');
                $table->timestamp('joined_at')->useCurrent();

                $table->unique(['group_id', 'user_id'], 'uniq_group_user');
            });
        }

        if (! Schema::hasTable('trip_group_messages')) {
            Schema::create('trip_group_messages', function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->unsignedBigInteger('group_id')->index();
                $table->unsignedBigInteger('user_id')->nullable()->index();
                $table->string('sender_email', 255)->nullable();
                $table->string('sender_name', 255)->nullable();
                $table->text('text')->nullable();
                $table->enum('type', ['system', 'user'])->default('user');
                $table->json('attachment')->nullable();
                $table->timestamp('created_at')->useCurrent();

                $table->index(['group_id', 'created_at'], 'idx_group_created');
            });
        }
    }

    public function down(): void
    {
        // Non-destructive down to avoid accidental data loss.
    }
};


<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Create the bookings table (schema based on the phpMyAdmin screenshot).
        // If the table already exists, we only add any missing columns and try to add the FK safely.
        if (! Schema::hasTable('bookings')) {
            Schema::create('bookings', function (Blueprint $table) {
                $table->string('id', 50)->primary();

                // Relationship (owner/customer accounts live in `users`)
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();

                $table->string('guest', 255);
                $table->string('customer_email', 255)->nullable();
                $table->string('customer_phone', 50)->nullable();

                $table->string('service', 255);
                $table->text('route')->nullable();
                $table->string('category', 50)->nullable()->default('hotel');

                $table->string('date_start', 50)->nullable();
                $table->string('date_end', 50)->nullable();
                $table->string('date', 50)->nullable();
                $table->string('time', 50)->nullable();

                $table->unsignedInteger('pax')->default(1);
                $table->string('guests', 50)->nullable();
                $table->unsignedInteger('nights')->nullable();
                $table->string('room_type', 100)->nullable();
                $table->string('vehicle_type', 100)->nullable();

                $table->decimal('amount', 12, 2);
                $table->decimal('total_amount', 12, 2)->nullable();

                $table->string('payment_method', 50)->nullable()->default('credit_card');
                $table->string('status', 20)->nullable()->default('pending');

                $table->json('rental')->nullable();
                $table->json('activities')->nullable();

                $table->string('reference', 100)->nullable();
                $table->text('special_requests')->nullable();

                $table->timestamps();

                $table->index('user_id');
                $table->index('status');
                $table->index('category');
                $table->index('created_at');
                $table->index('customer_email');
            });

            return;
        }

        // Table exists: add missing columns (non-destructive)
        Schema::table('bookings', function (Blueprint $table) {
            if (! Schema::hasColumn('bookings', 'user_id')) {
                $table->unsignedBigInteger('user_id')->nullable()->after('id');
            }
            if (! Schema::hasColumn('bookings', 'guest')) {
                $table->string('guest', 255)->nullable();
            }
            if (! Schema::hasColumn('bookings', 'customer_email')) {
                $table->string('customer_email', 255)->nullable();
            }
            if (! Schema::hasColumn('bookings', 'customer_phone')) {
                $table->string('customer_phone', 50)->nullable();
            }
            if (! Schema::hasColumn('bookings', 'service')) {
                $table->string('service', 255)->nullable();
            }
            if (! Schema::hasColumn('bookings', 'route')) {
                $table->text('route')->nullable();
            }
            if (! Schema::hasColumn('bookings', 'category')) {
                $table->string('category', 50)->nullable()->default('hotel');
            }
            if (! Schema::hasColumn('bookings', 'date_start')) {
                $table->string('date_start', 50)->nullable();
            }
            if (! Schema::hasColumn('bookings', 'date_end')) {
                $table->string('date_end', 50)->nullable();
            }
            if (! Schema::hasColumn('bookings', 'date')) {
                $table->string('date', 50)->nullable();
            }
            if (! Schema::hasColumn('bookings', 'time')) {
                $table->string('time', 50)->nullable();
            }
            if (! Schema::hasColumn('bookings', 'pax')) {
                $table->unsignedInteger('pax')->default(1);
            }
            if (! Schema::hasColumn('bookings', 'guests')) {
                $table->string('guests', 50)->nullable();
            }
            if (! Schema::hasColumn('bookings', 'nights')) {
                $table->unsignedInteger('nights')->nullable();
            }
            if (! Schema::hasColumn('bookings', 'room_type')) {
                $table->string('room_type', 100)->nullable();
            }
            if (! Schema::hasColumn('bookings', 'vehicle_type')) {
                $table->string('vehicle_type', 100)->nullable();
            }
            if (! Schema::hasColumn('bookings', 'amount')) {
                $table->decimal('amount', 12, 2)->default(0);
            }
            if (! Schema::hasColumn('bookings', 'total_amount')) {
                $table->decimal('total_amount', 12, 2)->nullable();
            }
            if (! Schema::hasColumn('bookings', 'payment_method')) {
                $table->string('payment_method', 50)->nullable()->default('credit_card');
            }
            if (! Schema::hasColumn('bookings', 'status')) {
                $table->string('status', 20)->nullable()->default('pending');
            }
            if (! Schema::hasColumn('bookings', 'rental')) {
                $table->json('rental')->nullable();
            }
            if (! Schema::hasColumn('bookings', 'activities')) {
                $table->json('activities')->nullable();
            }
            if (! Schema::hasColumn('bookings', 'reference')) {
                $table->string('reference', 100)->nullable();
            }
            if (! Schema::hasColumn('bookings', 'special_requests')) {
                $table->text('special_requests')->nullable();
            }
            if (! Schema::hasColumn('bookings', 'created_at')) {
                $table->timestamp('created_at')->nullable();
            }
            if (! Schema::hasColumn('bookings', 'updated_at')) {
                $table->timestamp('updated_at')->nullable();
            }
        });

        // Try to add the foreign key safely (won't fail migration if it can't be added).
        try {
            DB::statement('ALTER TABLE `bookings` ADD CONSTRAINT `bookings_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL');
        } catch (\Throwable $e) {
            // Ignore: constraint may already exist or column types may not match.
        }
    }

    public function down(): void
    {
        // Non-destructive: do not drop the bookings table on rollback.
        // This migration is meant to ensure schema compatibility.
    }
};


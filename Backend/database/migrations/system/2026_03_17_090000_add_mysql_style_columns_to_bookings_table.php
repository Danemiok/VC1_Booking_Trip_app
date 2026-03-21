<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('bookings')) {
            return;
        }

        Schema::table('bookings', function (Blueprint $table) {
            // Add snake_case columns used by the frontend-friendly MySQL schema.
            if (! Schema::hasColumn('bookings', 'customer_email')) {
                $table->string('customer_email')->nullable();
            }
            if (! Schema::hasColumn('bookings', 'customer_phone')) {
                $table->string('customer_phone', 50)->nullable();
            }
            if (! Schema::hasColumn('bookings', 'date_start')) {
                $table->string('date_start', 50)->nullable();
            }
            if (! Schema::hasColumn('bookings', 'date_end')) {
                $table->string('date_end', 50)->nullable();
            }
            if (! Schema::hasColumn('bookings', 'room_type')) {
                $table->string('room_type', 100)->nullable();
            }
            if (! Schema::hasColumn('bookings', 'vehicle_type')) {
                $table->string('vehicle_type', 100)->nullable();
            }
            if (! Schema::hasColumn('bookings', 'payment_method')) {
                $table->string('payment_method', 50)->nullable();
            }
            if (! Schema::hasColumn('bookings', 'special_requests')) {
                $table->text('special_requests')->nullable();
            }
            if (! Schema::hasColumn('bookings', 'total_amount')) {
                $table->decimal('total_amount', 12, 2)->nullable();
            }
            if (! Schema::hasColumn('bookings', 'guests')) {
                $table->string('guests', 50)->nullable();
            }
            if (! Schema::hasColumn('bookings', 'nights')) {
                $table->integer('nights')->nullable();
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

            // Standard Laravel timestamps (matches the provided SQL schema).
            if (! Schema::hasColumn('bookings', 'created_at')) {
                $table->timestamp('created_at')->nullable();
            }
            if (! Schema::hasColumn('bookings', 'updated_at')) {
                $table->timestamp('updated_at')->nullable();
            }
        });

        // The provided SQL schema intentionally avoids a FK constraint on user_id.
        // Best-effort drop for MySQL; ignore for SQLite/unsupported drivers.
        try {
            Schema::table('bookings', function (Blueprint $table) {
                $table->dropForeign(['user_id']);
            });
        } catch (\Throwable $e) {
            // ignore
        }

        // Add indexes if they don't already exist (ignore errors for cross-DB compatibility).
        try {
            Schema::table('bookings', function (Blueprint $table) {
                $table->index('user_id', 'idx_bookings_user_id');
                $table->index('status', 'idx_bookings_status');
                $table->index('category', 'idx_bookings_category');
                $table->index('created_at', 'idx_bookings_created_at');
                $table->index('customer_email', 'idx_bookings_customer_email');
            });
        } catch (\Throwable $e) {
            // Best-effort indexes; safe to ignore if they already exist or the DB doesn't support them.
        }
    }

    public function down(): void
    {
        // Non-destructive rollback (keep columns; only attempt to drop indexes).
        if (! Schema::hasTable('bookings')) {
            return;
        }

        try {
            Schema::table('bookings', function (Blueprint $table) {
                $table->dropIndex('idx_bookings_user_id');
                $table->dropIndex('idx_bookings_status');
                $table->dropIndex('idx_bookings_category');
                $table->dropIndex('idx_bookings_created_at');
                $table->dropIndex('idx_bookings_customer_email');
            });
        } catch (\Throwable $e) {
            // ignore
        }
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('notifications')) {
            return;
        }

        $existingIndexNames = [];
        try {
            $rows = DB::select('SHOW INDEX FROM `notifications`');
            foreach ($rows as $row) {
                $keyName = is_object($row) ? ($row->Key_name ?? null) : ($row['Key_name'] ?? null);
                if ($keyName) {
                    $existingIndexNames[(string) $keyName] = true;
                }
            }
        } catch (\Throwable $e) {
            // Ignore: best-effort portability (non-MySQL drivers, restricted perms, etc.).
        }

        // Add missing columns/indexes in a portable way first.
        Schema::table('notifications', function (Blueprint $table) use ($existingIndexNames) {
            if (! Schema::hasColumn('notifications', 'user_id')) {
                $table->unsignedBigInteger('user_id')->index();
            }
            if (! Schema::hasColumn('notifications', 'booking_id')) {
                $table->unsignedBigInteger('booking_id')->nullable()->index();
            }
            if (! Schema::hasColumn('notifications', 'type')) {
                $table->string('type', 50)->default('new_booking')->index();
            }
            if (! Schema::hasColumn('notifications', 'title')) {
                $table->string('title')->nullable();
            }
            if (! Schema::hasColumn('notifications', 'message')) {
                $table->text('message')->nullable();
            }
            if (! Schema::hasColumn('notifications', 'is_read')) {
                $table->boolean('is_read')->default(false)->index();
            }
            if (! Schema::hasColumn('notifications', 'data')) {
                $table->json('data')->nullable();
            }
            if (! Schema::hasColumn('notifications', 'created_at')) {
                $table->timestamp('created_at')->useCurrent();
            }
            if (! Schema::hasColumn('notifications', 'updated_at')) {
                $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
            }

            if (! isset($existingIndexNames['idx_user_id'])) {
                $table->index(['user_id'], 'idx_user_id');
            }
            if (! isset($existingIndexNames['idx_booking_id'])) {
                $table->index(['booking_id'], 'idx_booking_id');
            }
            if (! isset($existingIndexNames['idx_is_read'])) {
                $table->index(['is_read'], 'idx_is_read');
            }
            // Uniqueness is enforced by a follow-up migration to keep "one booking = one notification row".
        });

        // Then, try to align to the exact MySQL schema requested (best-effort; won't fail deploy if it can't).
        $enumValues = [
            'new_booking',
            'booking_cancelled',
            'booking_confirmed',
            'payment_success',
            'payment_failed',
            'system',
        ];
        $enumSql = "ENUM('" . implode("','", $enumValues) . "')";

        $statements = [
            "ALTER TABLE `notifications` MODIFY COLUMN `user_id` BIGINT UNSIGNED NOT NULL",
            "ALTER TABLE `notifications` MODIFY COLUMN `booking_id` BIGINT UNSIGNED NULL",
            "ALTER TABLE `notifications` MODIFY COLUMN `type` {$enumSql} NOT NULL DEFAULT 'new_booking'",
            "ALTER TABLE `notifications` MODIFY COLUMN `title` VARCHAR(255) NOT NULL",
            "ALTER TABLE `notifications` MODIFY COLUMN `message` TEXT NULL",
            "ALTER TABLE `notifications` MODIFY COLUMN `is_read` TINYINT(1) NOT NULL DEFAULT 0",
            "ALTER TABLE `notifications` MODIFY COLUMN `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP",
            "ALTER TABLE `notifications` MODIFY COLUMN `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
        ];

        foreach ($statements as $sql) {
            try {
                DB::statement($sql);
            } catch (\Throwable $e) {
                // Ignore if the driver doesn't support it or column types already match.
            }
        }
    }

    public function down(): void
    {
        // Non-destructive down to avoid accidental data loss.
    }
};

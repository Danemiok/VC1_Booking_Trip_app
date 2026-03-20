<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Best-effort: different MySQL setups may name indexes differently or already have desired constraints.
        $statements = [
            "ALTER TABLE `notifications` DROP INDEX `uniq_user_booking_type`",
        ];

        foreach ($statements as $sql) {
            try {
                DB::statement($sql);
            } catch (\Throwable $e) {
                // ignore
            }
        }

        try {
            DB::statement("ALTER TABLE `notifications` ADD UNIQUE KEY `uniq_booking_type` (`booking_id`,`type`)");
        } catch (\Throwable $e) {
            // ignore
        }
    }

    public function down(): void
    {
        // Non-destructive down to avoid accidental data loss.
    }
};


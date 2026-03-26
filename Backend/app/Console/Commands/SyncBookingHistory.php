<?php

namespace App\Console\Commands;

use App\Models\Booking;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class SyncBookingHistory extends Command
{
    protected $signature = 'booking-history:sync {--user_id=} {--dry-run}';

    protected $description = 'Backfill/sync booking_history rows from bookings';

    private function safeIntFromBookingCode(string $bookingCode): int
    {
        if (preg_match('/BK-(\d+)/', $bookingCode, $m)) {
            $digits = $m[1];
            if (strlen($digits) <= 9) {
                return max(1, (int) $digits);
            }
        }

        $unsigned = (int) sprintf('%u', crc32($bookingCode));
        $bounded = $unsigned % 2000000000;
        return $bounded > 0 ? $bounded : 1;
    }

    private function formatTravelDate(?string $dateStart, ?string $dateEnd, ?string $date, ?string $time): string
    {
        $dateStart = $dateStart ? trim($dateStart) : null;
        $dateEnd = $dateEnd ? trim($dateEnd) : null;
        $date = $date ? trim($date) : null;
        $time = $time ? trim($time) : null;

        if ($dateStart && $dateEnd) return $dateStart . ' to ' . $dateEnd;
        if ($dateStart) return $dateStart;
        if ($date && $time) return $date . ' ' . $time;
        if ($date) return $date;
        return '-';
    }

    public function handle(): int
    {
        if (! Schema::hasTable('booking_history')) {
            $this->error('booking_history table not found. Run: php artisan migrate');
            return self::FAILURE;
        }

        $historyColumns = [];
        try {
            $historyColumns = Schema::getColumnListing('booking_history');
        } catch (\Throwable $e) {
            $historyColumns = [];
        }
        $hasCustomerName = in_array('customer_name', $historyColumns, true);
        $hasCustomerEmail = in_array('customer_email', $historyColumns, true);

        $userId = $this->option('user_id');
        $dryRun = (bool) $this->option('dry-run');

        $query = Booking::query()->with(['user:id,name,email']);
        if ($userId) $query->where('user_id', $userId);

        $count = $query->count();
        if ($count === 0) {
            $this->info('No bookings found to sync.');
            return self::SUCCESS;
        }

        $this->info("Syncing {$count} booking(s) into booking_history" . ($dryRun ? ' (dry-run)' : '') . '...');
        $bar = $this->output->createProgressBar($count);
        $bar->start();

        $synced = 0;
        $query->orderBy('created_at')->chunk(200, function ($bookings) use ($dryRun, &$synced, $bar, $hasCustomerName, $hasCustomerEmail) {
            foreach ($bookings as $booking) {
                $bookingCode = (string) $booking->id;
                $bookingId = $this->safeIntFromBookingCode($bookingCode);
                $destination = trim((string) ($booking->service ?? ''));
                if ($destination === '') $destination = '-';

                $dateStart = $booking->date_start ?? $booking->dateStart ?? null;
                $dateEnd = $booking->date_end ?? $booking->dateEnd ?? null;
                $date = $booking->date ?? null;
                $time = $booking->time ?? null;

                $row = [
                    'booking_id' => $bookingId,
                    'user_id' => (int) $booking->user_id,
                    'booking_code' => $bookingCode,
                    'destination' => $destination,
                    'travel_date' => $this->formatTravelDate(
                        is_string($dateStart) ? $dateStart : null,
                        is_string($dateEnd) ? $dateEnd : null,
                        is_string($date) ? $date : null,
                        is_string($time) ? $time : null,
                    ),
                    'travelers' => (int) ($booking->pax ?? 0),
                    'amount' => (float) ($booking->amount ?? 0),
                    'status' => (string) ($booking->status ?? 'pending'),
                ];

                if ($hasCustomerName || $hasCustomerEmail) {
                    $customerName = trim((string) ($booking->guest ?? ''));
                    $customerEmail = trim((string) (($booking->customer_email ?? $booking->customerEmail) ?? ''));

                    if (($customerName === '' || $customerEmail === '') && $booking->user_id) {
                        try {
                            $user = $booking->relationLoaded('user') ? $booking->user : null;
                            if (! $user) {
                                $user = User::query()->find($booking->user_id, ['id', 'name', 'email']);
                            }
                            if ($user) {
                                if ($customerName === '') $customerName = trim((string) ($user->name ?? ''));
                                if ($customerEmail === '') $customerEmail = trim((string) ($user->email ?? ''));
                            }
                        } catch (\Throwable $e) {
                            // ignore
                        }
                    }

                    if ($hasCustomerName) $row['customer_name'] = $customerName !== '' ? $customerName : null;
                    if ($hasCustomerEmail) $row['customer_email'] = $customerEmail !== '' ? $customerEmail : null;
                }

                if (! $dryRun) {
                    $exists = DB::table('booking_history')
                        ->where('booking_code', $bookingCode)
                        ->where('user_id', (int) $booking->user_id)
                        ->exists();

                    if ($exists) {
                        DB::table('booking_history')
                            ->where('booking_code', $bookingCode)
                            ->where('user_id', (int) $booking->user_id)
                            ->update($row);
                    } else {
                        $row['created_at'] = $booking->created_at ?? now();
                        DB::table('booking_history')->insert($row);
                    }
                }

                $synced++;
                $bar->advance();
            }
        });

        $bar->finish();
        $this->newLine();
        $this->info("Done. Processed {$synced} booking(s).");

        return self::SUCCESS;
    }
}

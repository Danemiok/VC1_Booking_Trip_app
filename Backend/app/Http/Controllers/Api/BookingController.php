<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\AppNotification;
use App\Models\OwnerNotification;
use App\Models\RecentActivity;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\PersonalAccessToken;

class BookingController extends Controller
{
    private function hasBookingColumn(string $column): bool
    {
        static $columns = null;

        if ($columns === null) {
            $columns = Schema::getColumnListing('bookings');
        }

        return in_array($column, $columns, true);
    }

    private function toFrontendBooking(Booking $booking): array
    {
        $createdAt = $booking->created_at
            ? $booking->created_at->toIso8601String()
            : ($booking->createdAt ? $booking->createdAt->toIso8601String() : null);

        return [
            'id' => $booking->id,
            'guest' => $booking->guest,
            'service' => $booking->service,
            'route' => $booking->route,
            'category' => $booking->category,
            'dateStart' => $booking->date_start ?? $booking->dateStart,
            'dateEnd' => $booking->date_end ?? $booking->dateEnd,
            'date' => $booking->date,
            'time' => $booking->time,
            'pax' => $booking->pax,
            'amount' => $booking->amount,
            'status' => $booking->status,
            'roomType' => $booking->room_type ?? $booking->roomType,
            'vehicleType' => $booking->vehicle_type ?? $booking->vehicleType,
            'customerEmail' => $booking->customer_email ?? $booking->customerEmail,
            'customerPhone' => $booking->customer_phone ?? $booking->customerPhone,
            'specialRequests' => $booking->special_requests ?? $booking->specialRequests,
            'paymentMethod' => $booking->payment_method ?? $booking->paymentMethod,
            'createdAt' => $createdAt,
            // Extras (safe to ignore by the UI if unused)
            'guests' => $booking->guests,
            'nights' => $booking->nights,
            'totalAmount' => $booking->total_amount,
            'rental' => $booking->rental,
            'activities' => $booking->activities,
            'reference' => $booking->reference,
            'user_id' => $booking->user_id,
            'destination_id' => $booking->destination_id,
            'transport_id' => $booking->transport_id,
            'user' => $booking->relationLoaded('user') ? $booking->user : null,
        ];
    }
    private function ensureRole(Request $request, array $roles)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if (! in_array($user->role, $roles, true)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return null;
    }

    private function resolveUserFromBearerToken(Request $request)
    {
        $token = $request->bearerToken();
        if (! $token) {
            return null;
        }

        $accessToken = PersonalAccessToken::findToken($token);
        if (! $accessToken) {
            return null;
        }

        $tokenable = $accessToken->tokenable;

        return $tokenable instanceof \App\Models\User ? $tokenable : null;
    }

    /**
     * Get all bookings (for owner page)
     */
    public function index(Request $request)
    {
        $guard = $this->ensureRole($request, ['owner', 'admin']);
        if ($guard) {
            return $guard;
        }

        try {
            Log::info('Fetching bookings with filters:', $request->all());
            
            $query = Booking::query()->with(['user:id,name,email,role']);

            // Apply filters
            if ($request->has('service') && $request->service && $request->service !== 'all') {
                $query->where('category', $request->service);
            }

            if ($request->has('status') && $request->status && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            if ($request->has('min_amount') && $request->min_amount !== null && $request->min_amount !== '') {
                $query->where('amount', '>=', $request->min_amount);
            }

            if ($request->has('max_amount') && $request->max_amount !== null && $request->max_amount !== '') {
                $query->where('amount', '<=', $request->max_amount);
            }

            if ($request->has('guest_name') && $request->guest_name) {
                $query->where('guest', 'like', '%' . $request->guest_name . '%');
            }

            if ($request->has('booking_id') && $request->booking_id) {
                $query->where('id', 'like', '%' . $request->booking_id . '%');
            }

            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('id', 'like', "%{$search}%")
                      ->orWhere('guest', 'like', "%{$search}%")
                      ->orWhere('service', 'like', "%{$search}%")
                      ->orWhere('route', 'like', "%{$search}%")
                      ->orWhere('customer_email', 'like', "%{$search}%");

                    // Legacy column (older schema)
                    if ($this->hasBookingColumn('customerEmail')) {
                        $q->orWhere('customerEmail', 'like', "%{$search}%");
                    }
                });
            }

            if ($request->has('date_range') && $request->date_range !== 'all') {
                $days = $request->date_range === 'last7' ? 7 : 
                       ($request->date_range === 'last3' ? 3 : 1);
                $cutoff = now()->subDays($days);
                $query->where(function ($q) use ($cutoff) {
                    $q->where('created_at', '>=', $cutoff);

                    // Legacy column (older schema)
                    if ($this->hasBookingColumn('createdAt')) {
                        $q->orWhere('createdAt', '>=', $cutoff);
                    }
                });
            }

            $query->orderByDesc('created_at');
            if ($this->hasBookingColumn('createdAt')) {
                $query->orderByDesc('createdAt');
            }

            $bookings = $query->get();

            Log::info('Found ' . $bookings->count() . ' bookings');

            return response()->json([
                'success' => true,
                'data' => $bookings->map(fn (Booking $b) => $this->toFrontendBooking($b)),
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching bookings: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'data' => []
            ], 500);
        }
    }

    /**
     * Get bookings for the authenticated customer
     */
    public function myBookings(Request $request)
    {
        try {
            $user = $request->user();

            $bookings = Booking::query()
                ->with(['user:id,name,email,role'])
                ->where('user_id', $user->id)
                ->orderByDesc('created_at');

            if ($this->hasBookingColumn('createdAt')) {
                $bookings->orderByDesc('createdAt');
            }

            $bookings = $bookings->get();

            return response()->json([
                'success' => true,
                'data' => $bookings->map(fn (Booking $b) => $this->toFrontendBooking($b)),
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching customer bookings: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'data' => [],
            ], 500);
        }
    }

    /**
     * Get bookings by customer ID (restricted to the authenticated customer or admin)
     */
    public function customerBookings(Request $request, $customerId)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if ((string) $user->id !== (string) $customerId && $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        try {
            $bookings = Booking::query()
                ->with(['user:id,name,email,role'])
                ->where('user_id', $customerId)
                ->orderByDesc('created_at');

            if ($this->hasBookingColumn('createdAt')) {
                $bookings->orderByDesc('createdAt');
            }

            $bookings = $bookings->get();

            return response()->json([
                'success' => true,
                'data' => $bookings->map(fn (Booking $b) => $this->toFrontendBooking($b)),
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching bookings by customer: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'data' => [],
            ], 500);
        }
    }

    /**
     * Create a new booking (when user books)
     */
    public function store(Request $request)
    {
        try {
            Log::info('=== NEW BOOKING RECEIVED ===');
            Log::info('Booking data:', $request->all());

            $user = $request->user() ?? $this->resolveUserFromBearerToken($request);
            $category = (string) $request->input('category', '');
            $isTripBooking = $category === 'trip';

            // Accept both camelCase (frontend) and snake_case (DB) field names.
            $payload = $request->all();
            $payload['customerEmail'] = $payload['customerEmail'] ?? $payload['customer_email'] ?? null;
            $payload['customerPhone'] = $payload['customerPhone'] ?? $payload['customer_phone'] ?? null;
            $payload['dateStart'] = $payload['dateStart'] ?? $payload['date_start'] ?? null;
            $payload['dateEnd'] = $payload['dateEnd'] ?? $payload['date_end'] ?? null;
            $payload['roomType'] = $payload['roomType'] ?? $payload['room_type'] ?? null;
            $payload['vehicleType'] = $payload['vehicleType'] ?? $payload['vehicle_type'] ?? null;
            $payload['paymentMethod'] = $payload['paymentMethod'] ?? $payload['payment_method'] ?? null;
            $payload['specialRequests'] = $payload['specialRequests'] ?? $payload['special_requests'] ?? null;
            $payload['totalAmount'] = $payload['totalAmount'] ?? $payload['total_amount'] ?? null;

            $validator = Validator::make($payload, [
                'id' => 'required|string|unique:bookings,id',
                'guest' => $user ? 'nullable|string' : 'required|string',
                'service' => 'required|string',
                'route' => 'required|string',
                'pax' => 'required|integer|min:1',
                'amount' => 'nullable|numeric|min:0',
                'status' => 'required|string',
                'category' => 'required|in:hotel,transport,trip',
                'customerEmail' => $user ? 'nullable|email' : 'required|email',
                'customerPhone' => $user ? 'nullable|string' : 'required|string',
                'destination_id' => $isTripBooking ? 'required|integer|min:1' : 'nullable|integer|min:1',
                'transport_id' => $isTripBooking ? 'required|integer|min:1' : 'nullable|integer|min:1',
                'travel_date' => $isTripBooking ? 'required|date' : 'nullable|date',
            ]);

            if ($validator->fails()) {
                Log::error('Validation failed:', $validator->errors()->toArray());
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $amount = $payload['amount'] ?? 0;
            if ($amount === null || $amount === '') {
                $amount = 0;
            }

            $guestName = $payload['guest'] ?? null;
            if ($user && isset($user->name) && $user->name) {
                $guestName = $user->name;
            }

            $createdAtRaw = $payload['createdAt'] ?? $payload['created_at'] ?? null;
            $createdAt = $createdAtRaw ? \Illuminate\Support\Carbon::parse($createdAtRaw) : now();
            $createdAtIso = $createdAt->toIso8601String();

            // Store into snake_case columns (matches the provided SQL schema),
            // while still accepting the frontend's camelCase payload.
            $data = [
                'id' => $payload['id'],
                'user_id' => $user ? $user->id : ($payload['user_id'] ?? null),
                'guest' => $guestName,
                'customer_email' => $payload['customerEmail'] ?? null,
                'customer_phone' => $payload['customerPhone'] ?? null,
                'service' => $payload['service'],
                'route' => $payload['route'],
                'category' => $payload['category'],
                'date_start' => $payload['dateStart'] ?? null,
                'date_end' => $payload['dateEnd'] ?? null,
                'date' => $payload['date'] ?? ($payload['travel_date'] ?? null),
                'time' => $payload['time'] ?? null,
                'pax' => (int) ($payload['pax'] ?? 1),
                'guests' => $payload['guests'] ?? null,
                'nights' => $payload['nights'] ?? null,
                'room_type' => $payload['roomType'] ?? null,
                'vehicle_type' => $payload['vehicleType'] ?? null,
                'amount' => $amount,
                'total_amount' => $payload['totalAmount'] ?? null,
                'payment_method' => $payload['paymentMethod'] ?? null,
                'status' => $payload['status'],
                'rental' => $payload['rental'] ?? null,
                'activities' => $payload['activities'] ?? null,
                'reference' => $payload['reference'] ?? null,
                'special_requests' => $payload['specialRequests'] ?? null,
                'destination_id' => $payload['destination_id'] ?? null,
                'transport_id' => $payload['transport_id'] ?? null,
                'created_at' => $createdAt,
                'updated_at' => now(),
                // Keep legacy createdAt for older consumers (harmless if column exists)
                'createdAt' => $createdAtIso,
            ];

            // Not all deployments have the same `bookings` table columns (some use a pure MySQL schema).
            // Filter out any keys that don't exist to avoid "Unknown column" SQL errors.
            $allowed = array_flip(Schema::getColumnListing('bookings'));
            $data = array_intersect_key($data, $allowed);

            // Create booking
            $booking = Booking::create($data);

            Log::info('Booking saved successfully! ID: ' . $booking->id);

            // Create owner/admin notifications (best-effort: never fail the booking request because of notifications)
            try {
                $snapshot = $this->toFrontendBooking($booking);
                $guest = (string) ($snapshot['guest'] ?? 'A customer');
                $service = (string) ($snapshot['service'] ?? 'a service');
                $route = (string) ($snapshot['route'] ?? '');
                $amount = (float) ($snapshot['amount'] ?? 0);

                $title = 'New booking: ' . $booking->id;
                $message = trim($guest . ' booked ' . $service . ($route ? ' (' . $route . ')' : '') . ' • $' . number_format($amount, 2));

                // Role values can vary by casing across deployments ("Owner" vs "owner").
                $owners = User::query()
                    ->whereRaw('LOWER(role) IN (?, ?)', ['owner', 'admin'])
                    ->get(['id']);

                $useNotificationsTable = Schema::hasTable('notifications');
                $notificationsColumns = $useNotificationsTable ? Schema::getColumnListing('notifications') : [];
                $activitiesTableExists = Schema::hasTable('recent_activities');
                $activitiesColumns = $activitiesTableExists ? Schema::getColumnListing('recent_activities') : [];

                foreach ($owners as $owner) {
                    $payload = [
                        'user_id' => $owner->id,
                        'booking_id' => (string) $booking->id,
                        'title' => $title,
                        'message' => $message,
                        'data' => $snapshot,
                        'read_at' => null,
                    ];

                    if ($useNotificationsTable) {
                        try {
                            // Support multiple `notifications` schemas (some created manually in phpMyAdmin).
                            $row = [];
                            if (in_array('user_id', $notificationsColumns, true)) $row['user_id'] = $owner->id;
                            if (in_array('booking_id', $notificationsColumns, true)) $row['booking_id'] = (string) $booking->id;
                            if (in_array('recipient_type', $notificationsColumns, true)) $row['recipient_type'] = 'owner';
                            if (in_array('notification_type', $notificationsColumns, true)) $row['notification_type'] = 'new_booking';
                            if (in_array('type', $notificationsColumns, true)) $row['type'] = 'booking_created';
                            if (in_array('title', $notificationsColumns, true)) $row['title'] = $title;
                            if (in_array('message', $notificationsColumns, true)) $row['message'] = $message;
                            if (in_array('data', $notificationsColumns, true)) $row['data'] = json_encode($snapshot);
                            if (in_array('notification_data', $notificationsColumns, true)) $row['notification_data'] = json_encode($snapshot);
                            if (in_array('read_at', $notificationsColumns, true)) $row['read_at'] = null;
                            if (in_array('is_read', $notificationsColumns, true)) $row['is_read'] = 0;
                            if (in_array('email_sent', $notificationsColumns, true)) $row['email_sent'] = 0;
                            if (in_array('created_at', $notificationsColumns, true)) $row['created_at'] = now();
                            if (in_array('updated_at', $notificationsColumns, true)) $row['updated_at'] = now();

                            $notificationId = DB::table('notifications')->insertGetId($row);

                            if ($activitiesTableExists) {
                                $activity = [];
                                if (in_array('booking_id', $activitiesColumns, true)) $activity['booking_id'] = (string) $booking->id;
                                if (in_array('user_id', $activitiesColumns, true)) $activity['user_id'] = $owner->id;
                                if (in_array('notification_id', $activitiesColumns, true)) $activity['notification_id'] = $notificationId;
                                if (in_array('activity_type', $activitiesColumns, true)) $activity['activity_type'] = 'new_booking';
                                if (in_array('title', $activitiesColumns, true)) $activity['title'] = $title;
                                if (in_array('description', $activitiesColumns, true)) $activity['description'] = $message;
                                if (in_array('activity_data', $activitiesColumns, true)) $activity['activity_data'] = json_encode($snapshot);
                                if (in_array('ip_address', $activitiesColumns, true)) $activity['ip_address'] = $request->ip();
                                if (in_array('user_agent', $activitiesColumns, true)) $activity['user_agent'] = $request->userAgent();
                                if (in_array('created_at', $activitiesColumns, true)) $activity['created_at'] = now();

                                DB::table('recent_activities')->insert($activity);
                            }
                        } catch (\Throwable $inner) {
                            // If the `notifications` table exists but has a mismatched schema, fall back.
                            $created = OwnerNotification::create($payload);
                            if ($activitiesTableExists) {
                                try {
                                    $activity = [];
                                    if (in_array('booking_id', $activitiesColumns, true)) $activity['booking_id'] = (string) $booking->id;
                                    if (in_array('user_id', $activitiesColumns, true)) $activity['user_id'] = $owner->id;
                                    if (in_array('notification_id', $activitiesColumns, true)) $activity['notification_id'] = null;
                                    if (in_array('activity_type', $activitiesColumns, true)) $activity['activity_type'] = 'new_booking';
                                    if (in_array('title', $activitiesColumns, true)) $activity['title'] = $title;
                                    if (in_array('description', $activitiesColumns, true)) $activity['description'] = $message;
                                    if (in_array('activity_data', $activitiesColumns, true)) $activity['activity_data'] = json_encode($snapshot);
                                    if (in_array('ip_address', $activitiesColumns, true)) $activity['ip_address'] = $request->ip();
                                    if (in_array('user_agent', $activitiesColumns, true)) $activity['user_agent'] = $request->userAgent();
                                    if (in_array('created_at', $activitiesColumns, true)) $activity['created_at'] = now();

                                    DB::table('recent_activities')->insert($activity);
                                } catch (\Throwable $e) {
                                    // ignore activity insert failures
                                }
                            }
                        }
                    } else {
                        $created = OwnerNotification::create($payload);
                        if ($activitiesTableExists) {
                            try {
                                $activity = [];
                                if (in_array('booking_id', $activitiesColumns, true)) $activity['booking_id'] = (string) $booking->id;
                                if (in_array('user_id', $activitiesColumns, true)) $activity['user_id'] = $owner->id;
                                if (in_array('notification_id', $activitiesColumns, true)) $activity['notification_id'] = null;
                                if (in_array('activity_type', $activitiesColumns, true)) $activity['activity_type'] = 'new_booking';
                                if (in_array('title', $activitiesColumns, true)) $activity['title'] = $title;
                                if (in_array('description', $activitiesColumns, true)) $activity['description'] = $message;
                                if (in_array('activity_data', $activitiesColumns, true)) $activity['activity_data'] = json_encode($snapshot);
                                if (in_array('ip_address', $activitiesColumns, true)) $activity['ip_address'] = $request->ip();
                                if (in_array('user_agent', $activitiesColumns, true)) $activity['user_agent'] = $request->userAgent();
                                if (in_array('created_at', $activitiesColumns, true)) $activity['created_at'] = now();

                                DB::table('recent_activities')->insert($activity);
                            } catch (\Throwable $e) {
                                // ignore activity insert failures
                            }
                        }
                    }
                }
            } catch (\Throwable $e) {
                Log::error('Failed to create owner notification: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Booking created successfully',
                'data' => $this->toFrontendBooking($booking)
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating booking: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create booking: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get booking statistics for dashboard
     */
    public function stats(Request $request)
    {
        $guard = $this->ensureRole($request, ['owner', 'admin']);
        if ($guard) {
            return $guard;
        }

        try {
            $totalBookings = Booking::count();
            $activeGuests = Booking::where('status', 'paid')->sum('pax');
            $pendingPayments = Booking::where('status', 'pending')->sum('amount');

            return response()->json([
                'total_bookings' => number_format($totalBookings),
                'active_guests' => (string)$activeGuests,
                'pending_payments' => '$' . number_format($pendingPayments, 2)
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching stats: ' . $e->getMessage());
            return response()->json([
                'total_bookings' => '0',
                'active_guests' => '0',
                'pending_payments' => '$0'
            ]);
        }
    }

    /**
     * Export bookings to CSV
     */
    public function export(Request $request)
    {
        $guard = $this->ensureRole($request, ['owner', 'admin']);
        if ($guard) {
            return $guard;
        }

        try {
            $query = Booking::query();

            if ($request->has('service') && $request->service && $request->service !== 'all') {
                $query->where('category', $request->service);
            }

            $query->orderByDesc('created_at');
            if ($this->hasBookingColumn('createdAt')) {
                $query->orderByDesc('createdAt');
            }

            $bookings = $query->get();
            $rows = $bookings->map(fn (Booking $b) => $this->toFrontendBooking($b));

            $headers = [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="bookings-' . date('Y-m-d') . '.csv"',
            ];

            $callback = function() use ($rows) {
                $file = fopen('php://output', 'w');
                
                // Add headers
                fputcsv($file, ['Booking ID', 'Guest Name', 'Service', 'Route', 'Date', 'Pax', 'Amount', 'Status', 'Email', 'Phone']);
                
                // Add data
                foreach ($rows as $booking) {
                    $dateInfo = ($booking['category'] ?? '') === 'hotel'
                        ? (($booking['dateStart'] ?? '') ? ($booking['dateStart'] . ' to ' . ($booking['dateEnd'] ?? '')) : '')
                        : (($booking['date'] ?? '') ? ($booking['date'] . ' ' . ($booking['time'] ?? '')) : '');
                        
                    fputcsv($file, [
                        $booking['id'] ?? '',
                        $booking['guest'] ?? '',
                        $booking['service'] ?? '',
                        $booking['route'] ?? '',
                        $dateInfo,
                        $booking['pax'] ?? 0,
                        '$' . number_format((float) ($booking['amount'] ?? 0), 2),
                        ucfirst((string) ($booking['status'] ?? 'pending')),
                        $booking['customerEmail'] ?? '',
                        $booking['customerPhone'] ?? '',
                    ]);
                }
                
                fclose($file);
            };

            return response()->stream($callback, 200, $headers);
        } catch (\Exception $e) {
            Log::error('Error exporting bookings: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Export failed'
            ], 500);
        }
    }

    /**
     * Update booking status
     */
    public function updateStatus(Request $request, $id)
    {
        $guard = $this->ensureRole($request, ['owner', 'admin']);
        if ($guard) {
            return $guard;
        }

        try {
            $booking = Booking::find($id);
            
            if (!$booking) {
                return response()->json([
                    'success' => false,
                    'message' => 'Booking not found'
                ], 404);
            }

            $booking->status = $request->status;
            $booking->save();

            Log::info('Booking status updated: ' . $id . ' to ' . $request->status);

            return response()->json([
                'success' => true,
                'message' => 'Booking status updated',
                'data' => $booking
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating status: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update status'
            ], 500);
        }
    }
}

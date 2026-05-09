<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class BookingHistoryController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
                'data' => [],
            ], 401);
        }

        if (! Schema::hasTable('booking_history')) {
            return response()->json([
                'success' => true,
                'data' => [],
            ]);
        }

        $query = DB::table('booking_history')
            ->where('user_id', $user->id);

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = trim((string) $request->search);

            $query->where(function ($q) use ($search) {
                $q->where('booking_code', 'like', '%' . $search . '%')
                    ->orWhere('destination', 'like', '%' . $search . '%')
                    ->orWhere('travel_date', 'like', '%' . $search . '%')
                    ->orWhere('status', 'like', '%' . $search . '%');

                if (Schema::hasColumn('booking_history', 'customer_name')) {
                    $q->orWhere('customer_name', 'like', '%' . $search . '%');
                }

                if (Schema::hasColumn('booking_history', 'customer_email')) {
                    $q->orWhere('customer_email', 'like', '%' . $search . '%');
                }
            });
        }

        $limit = (int) $request->input('limit', 100);
        $limit = max(1, min($limit, 500));

        $rows = $query
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(function ($row) {
                return [
                    'id' => (int) $row->id,
                    'booking_id' => $row->booking_id ? (int) $row->booking_id : null,
                    'booking_code' => (string) $row->booking_code,
                    'destination' => (string) ($row->destination ?? ''),
                    'travel_date' => (string) ($row->travel_date ?? ''),
                    'travelers' => (int) ($row->travelers ?? 0),
                    'amount' => (float) ($row->amount ?? 0),
                    'status' => (string) ($row->status ?? 'pending'),
                    'customer_name' => $row->customer_name ?? null,
                    'customer_email' => $row->customer_email ?? null,
                    'created_at' => $row->created_at ?? null,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $rows,
        ]);
    }
}

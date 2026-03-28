<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Booking;

class BookingController extends Controller
{
    // Get all bookings of the authenticated customer
    public function index(Request $request)
    {
        $customer = $request->user();

        $bookings = Booking::where('customer_id', $customer->id)->get();

        return response()->json([
            'success' => true,
            'data' => $bookings
        ]);
    }

    // Create a new booking
    public function store(Request $request)
    {
        $request->validate([
            'destination_id' => 'required|integer|exists:destinations,id',
            'trip_date' => 'required|date',
            'participants' => 'required|integer|min:1',
        ]);

        $customer = $request->user();

        $booking = Booking::create([
            'customer_id' => $customer->id,
            'destination_id' => $request->destination_id,
            'trip_date' => $request->trip_date,
            'participants' => $request->participants,
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'data' => $booking
        ], 201);
    }
}
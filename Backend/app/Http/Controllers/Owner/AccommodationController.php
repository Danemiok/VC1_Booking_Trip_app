<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Accommodation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AccommodationController extends Controller
{
    /**
     * Get all active hotels for customers (public)
     */
    public function indexPublic()
    {
        $hotels = Accommodation::where('is_active', true)->get();
        return response()->json($hotels);
    }

    /**
     * Get owner's hotels
     */
    public function index()
    {
        $hotels = Accommodation::where('owner_id', Auth::id())->get();
        return response()->json($hotels);
    }

    /**
     * Store new hotel
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'hotel_name' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'country' => 'required|string|max:100',
            'address' => 'required|string|max:500',
            'description' => 'nullable|string',
            'stars_rating' => 'nullable|numeric|min:0|max:5',
            'is_active' => 'boolean',
        ]);

        $validated['owner_id'] = Auth::id();

        $hotel = Accommodation::create($validated);

        return response()->json($hotel, 201);
    }

    /**
     * Show one hotel
     */
    public function show(Accommodation $accommodation)
    {
        if ($accommodation->owner_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json($accommodation);
    }

    /**
     * Update hotel
     */
    public function update(Request $request, Accommodation $accommodation)
    {
        if ($accommodation->owner_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'hotel_name' => 'string|max:255',
            'city' => 'string|max:100',
            'country' => 'string|max:100',
            'address' => 'string|max:500',
            'description' => 'nullable|string',
            'stars_rating' => 'nullable|numeric|min:0|max:5',
            'is_active' => 'boolean',
        ]);

        $accommodation->update($validated);

        return response()->json($accommodation);
    }

    /**
     * Delete hotel
     */
    public function destroy(Accommodation $accommodation)
    {
        if ($accommodation->owner_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $accommodation->delete();

        return response()->json(['message' => 'Hotel deleted']);
    }
}
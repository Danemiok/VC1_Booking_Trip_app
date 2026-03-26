<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Destination;
use App\Services\PromotionService;

class HotelController extends Controller
{
    /**
     * Public list of all active destinations (used as hotels for customers)
     */
    public function index()
    {
        $destinations = Destination::query()
            ->where('status', 'active')
            ->with(['user:id,name,email'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($destination) {
                // Get promotion info for this destination
                $promotionInfo = PromotionService::getBestPromotionForDestination(
                    floatval($destination->price),
                    $destination->destination_id
                );

                return [
                    'id' => $destination->id,
                    'destination_id' => $destination->destination_id,
                    'name' => $destination->name,
                    'hotel_name' => $destination->name,
                    'location' => $destination->location,
                    'city' => $destination->location,
                    'country' => 'Cambodia',
                    'price' => floatval($destination->price),
                    'original_price' => $promotionInfo['original_price'],
                    'discounted_price' => $promotionInfo['discounted_price'],
                    'discount_amount' => $promotionInfo['discount_amount'],
                    'discount_percentage' => $promotionInfo['discount_percentage'],
                    'has_promotion' => $promotionInfo['promotion'] !== null,
                    'promotion' => $promotionInfo['promotion'],
                    'rating' => floatval($destination->rating ?? 0),
                    'stars_rating' => floatval($destination->rating ?? 0),
                    'image' => $destination->image,
                    'description' => $destination->description,
                    'address' => $destination->address ?? $destination->location,
                    'type' => $destination->type,
                    'amenities' => ['WiFi', 'Pool', 'Restaurant'],
                    'rooms' => 50,
                    'available' => true,
                    'is_active' => true,
                    'owner' => $destination->user ? [
                        'id' => $destination->user->id,
                        'name' => $destination->user->name,
                        'email' => $destination->user->email,
                    ] : null,
                    'created_at' => $destination->created_at,
                    'total_bookings' => $destination->total_bookings ?? 0,
                ];
            });

        return response()->json($destinations);
    }
}

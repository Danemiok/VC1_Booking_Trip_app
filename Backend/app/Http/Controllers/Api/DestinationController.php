<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Destination;

class DestinationController extends Controller
{
    private function extractCountry(?string $location): ?string
    {
        $parts = array_values(array_filter(array_map(
            fn ($part) => trim((string) $part),
            explode(',', (string) $location)
        )));

        return $parts !== [] ? end($parts) : null;
    }

    private function normalizeAmenities($amenities): array
    {
        if (!is_array($amenities)) {
            return [];
        }

        return array_values(array_filter(array_map(
            fn ($item) => is_string($item) ? trim($item) : '',
            $amenities
        )));
    }

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
                $isActive = strtolower((string) ($destination->status ?? '')) === 'active';
                $rooms = is_numeric($destination->rooms ?? null) ? (int) $destination->rooms : null;

                return [
                    'id' => $destination->id,
                    'name' => $destination->name,
                    'hotel_name' => $destination->name,
                    'location' => $destination->location,
                    'latitude' => $destination->latitude !== null ? (float) $destination->latitude : null,
                    'longitude' => $destination->longitude !== null ? (float) $destination->longitude : null,
                    'city' => $destination->location,
                    'country' => $this->extractCountry($destination->location),
                    'price' => floatval($destination->price),
                    'rating' => floatval($destination->rating ?? 0),
                    'stars_rating' => floatval($destination->rating ?? 0),
                    'image' => $destination->image,
                    'description' => $destination->description,
                    'address' => $destination->address ?? $destination->location,
                    'type' => $destination->type,
                    'amenities' => $this->normalizeAmenities($destination->amenities ?? null),
                    'rooms' => $rooms,
                    'available' => $isActive,
                    'is_active' => $isActive,
                    'owner' => $destination->user ? [
                        'id' => $destination->user->id,
                        'name' => $destination->user->name,
                        'email' => $destination->user->email,
                    ] : null,
                    'created_at' => $destination->created_at,
                    'total_bookings' => (int) ($destination->total_bookings ?? 0),
                ];
            });

        return response()->json($destinations);
    }
}

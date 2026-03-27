<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Destination;
use App\Services\PromotionService;
use Illuminate\Support\Str;

class HotelController extends Controller
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

    private function buildPublicImageUrl(?string $value): ?string
    {
        if (!$value) {
            return null;
        }

        $normalized = str_replace('\\', '/', trim($value));

        if ($normalized === '') {
            return null;
        }

        if (preg_match('#^https?:/[^/]#i', $normalized)) {
            $normalized = preg_replace('#^([a-z]+:)/#i', '$1//', $normalized);
        }

        if (preg_match('#^https?://#i', $normalized)) {
            $path = parse_url($normalized, PHP_URL_PATH) ?? '';
            if ($path && str_contains($path, '/storage/')) {
                $normalized = substr($path, strpos($path, '/storage/') + strlen('/storage/'));
            } else {
                return $normalized;
            }
        }

        $relative = ltrim($normalized, '/');

        if (str_starts_with($relative, 'storage/')) {
            $relative = substr($relative, strlen('storage/'));
        }

        if (Str::contains($relative, ['..', './', '.\\'])) {
            return null;
        }

        $storagePath = public_path('storage');
        if (is_dir($storagePath) || is_link($storagePath)) {
            return url('/storage/' . $relative);
        }

        return url('/api/files/' . $relative);
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
                // Get promotion info for this destination
                $promotionInfo = PromotionService::getBestPromotionForDestination(
                    floatval($destination->price),
                    $destination->id
                );
                $images = is_array($destination->images) ? $destination->images : [];
                $isActive = strtolower((string) ($destination->status ?? '')) === 'active';
                $rooms = is_numeric($destination->rooms ?? null) ? (int) $destination->rooms : null;

                return [
                    'id' => $destination->id,
                    'destination_id' => $destination->id,
                    'name' => $destination->name,
                    'hotel_name' => $destination->name,
                    'location' => $destination->location,
                    'city' => $destination->location,
                    'country' => $this->extractCountry($destination->location),
                    'price' => floatval($destination->price),
                    'original_price' => $promotionInfo['original_price'],
                    'discounted_price' => $promotionInfo['discounted_price'],
                    'discount_amount' => $promotionInfo['discount_amount'],
                    'discount_percentage' => $promotionInfo['discount_percentage'],
                    'has_promotion' => $promotionInfo['promotion'] !== null,
                    'promotion' => $promotionInfo['promotion'],
                    'rating' => floatval($destination->rating ?? 0),
                    'stars_rating' => floatval($destination->rating ?? 0),
                    'image' => $this->buildPublicImageUrl($destination->image),
                    'images' => array_values(array_filter(array_map(
                        fn ($image) => $this->buildPublicImageUrl(is_string($image) ? $image : ''),
                        $images
                    ))),
                    'description' => $destination->description,
                    'address' => $destination->address ?? $destination->location,
                    'latitude' => $destination->latitude,
                    'longitude' => $destination->longitude,
                    'type' => $destination->type,
                    'status' => $destination->status,
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

<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Transport;
use App\Services\PromotionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class TransportController extends Controller
{
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
            } elseif ($path && str_contains($path, '/api/files/')) {
                $normalized = substr($path, strpos($path, '/api/files/') + strlen('/api/files/'));
            } else {
                return $normalized;
            }
        }

        $relative = ltrim($normalized, '/');

        if (str_starts_with($relative, 'storage/')) {
            $relative = substr($relative, strlen('storage/'));
        }

        if (str_starts_with($relative, 'public/')) {
            $relative = substr($relative, strlen('public/'));
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

    private function toPublicTransportPhotoUrl(?string $value): ?string
    {
        if (!$value) {
            return null;
        }

        $normalized = str_replace('\\', '/', trim($value));
        if ($normalized === '') {
            return null;
        }

        if (preg_match('#^https?://#i', $normalized)) {
            return $normalized;
        }

        $relative = ltrim($normalized, '/');

        if (Str::startsWith($relative, 'storage/')) {
            return $relative;
        }

        if (Str::startsWith($relative, 'api/files/')) {
            return $relative;
        }

        return 'storage/' . $relative;
    }

    private function formatTransport(Transport $transport): array
    {
        return [
            'transport_id' => $transport->transport_id,
            'id' => $transport->transport_id,
            'owner_id' => $transport->owner_id,
            'service_name' => $transport->service_name,
            'transport_type' => $transport->transport_type,
            'price_per_km' => $transport->price_per_km,
            'is_free' => (bool) $transport->is_free,
            'route_description' => $transport->route_description,
            'service_details' => $transport->service_details,
            'vehicle_photo_url' => $this->buildPublicImageUrl($transport->vehicle_photo_url),
            'status' => $transport->status,
            'created_at' => $transport->created_at,
            'updated_at' => $transport->updated_at,
        ];
    }

    public function publicIndex()
    {
        $transports = Transport::query()
            ->orderByDesc('transport_id')
            ->get()
            ->map(function (Transport $transport) {
                // Get promotion info for this transport
                $basePrice = floatval($transport->price_per_km ?? 0);
                $promotionInfo = PromotionService::getBestPromotionForTransport($basePrice, $transport->transport_id);

                return array_merge(
                    $this->formatTransport($transport),
                    [
                        'original_price' => $promotionInfo['original_price'],
                        'discounted_price' => $promotionInfo['discounted_price'],
                        'discount_amount' => $promotionInfo['discount_amount'],
                        'discount_percentage' => $promotionInfo['discount_percentage'],
                        'has_promotion' => $promotionInfo['promotion'] !== null,
                        'promotion' => $promotionInfo['promotion'],
                    ]
                );
            });

        return response()->json([
            'message' => 'Transports fetched successfully',
            'data' => $transports->values(),
        ]);
    }

    public function index(Request $request)
    {
        $transports = Transport::query()
            ->where('owner_id', $request->user()->id)
            ->orderByDesc('transport_id')
            ->get();

        return response()->json([
            'message' => 'Transports fetched successfully',
            'data' => $transports->map(fn (Transport $transport) => $this->formatTransport($transport))->values(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'service_name' => ['required', 'string', 'max:255'],
            'transport_type' => ['nullable', 'in:Car Rental,Train,Bus,Other'],
            'price_per_km' => ['required', 'numeric', 'min:0'],
            'is_free' => ['nullable', 'boolean'],
            'route_description' => ['nullable', 'string'],
            'service_details' => ['nullable', 'string'],
            'vehicle_photo_url' => ['nullable', 'string', 'max:500'],
            'vehicle_photo' => ['nullable', 'image', 'max:10240'],
            'status' => ['nullable', 'in:active,inactive,pending'],
        ]);

        $isFree = filter_var($validated['is_free'] ?? false, FILTER_VALIDATE_BOOLEAN);

        $photoPath = $validated['vehicle_photo_url'] ?? null;
        if ($request->hasFile('vehicle_photo')) {
            $file = $request->file('vehicle_photo');
            $storedPath = $file->storePublicly('uploads/transports', 'public');
            $photoPath = $this->toPublicTransportPhotoUrl($storedPath);
        }

        $transport = Transport::create([
            'owner_id' => $request->user()->id,
            'service_name' => $validated['service_name'],
            'transport_type' => $validated['transport_type'] ?? 'Car Rental',
            'price_per_km' => $isFree ? 0 : $validated['price_per_km'],
            'is_free' => $isFree,
            'route_description' => $validated['route_description'] ?? null,
            'service_details' => $validated['service_details'] ?? null,
            'vehicle_photo_url' => $photoPath,
            'status' => $validated['status'] ?? 'pending',
        ]);

        return response()->json([
            'message' => 'Transport created successfully',
            'data' => $this->formatTransport($transport->fresh()),
        ], 201);
    }

    public function destroy(Request $request, Transport $transport)
    {
        if ($transport->owner_id !== $request->user()->id) {
            return response()->json([
                'message' => 'You are not allowed to delete this transport.',
            ], 403);
        }

        $photoPath = $transport->vehicle_photo_url;
        if ($photoPath && !str_starts_with($photoPath, 'http')) {
            $relativePath = ltrim($photoPath, '/');
            $fullPath = public_path($relativePath);
            if (is_file($fullPath)) {
                @unlink($fullPath);
            }
        }

        $transport->delete();

        return response()->json([
            'message' => 'Transport deleted successfully',
        ]);
    }

    public function update(Request $request, Transport $transport)
    {
        if ($transport->owner_id !== $request->user()->id) {
            return response()->json([
                'message' => 'You are not allowed to update this transport.',
            ], 403);
        }

        $validated = $request->validate([
            'service_name' => ['required', 'string', 'max:255'],
            'transport_type' => ['nullable', 'in:Car Rental,Train,Bus,Other'],
            'price_per_km' => ['required', 'numeric', 'min:0'],
            'is_free' => ['nullable', 'boolean'],
            'route_description' => ['nullable', 'string'],
            'service_details' => ['nullable', 'string'],
            'vehicle_photo_url' => ['nullable', 'string', 'max:500'],
            'vehicle_photo' => ['nullable', 'image', 'max:10240'],
            'status' => ['nullable', 'in:active,inactive,pending'],
        ]);

        $isFree = filter_var($validated['is_free'] ?? $transport->is_free ?? false, FILTER_VALIDATE_BOOLEAN);

        $photoPath = $validated['vehicle_photo_url'] ?? $transport->vehicle_photo_url;
        if ($request->hasFile('vehicle_photo')) {
            $file = $request->file('vehicle_photo');
            $storedPath = $file->storePublicly('uploads/transports', 'public');
            $photoPath = $this->toPublicTransportPhotoUrl($storedPath);

            $oldPhoto = $transport->vehicle_photo_url;
            if ($oldPhoto && !str_starts_with($oldPhoto, 'http')) {
                $relativePath = ltrim($oldPhoto, '/');
                $fullPath = public_path($relativePath);
                if (is_file($fullPath)) {
                    @unlink($fullPath);
                }
            }
        }

        $transport->update([
            'service_name' => $validated['service_name'],
            'transport_type' => $validated['transport_type'] ?? $transport->transport_type ?? 'Car Rental',
            'price_per_km' => $isFree ? 0 : $validated['price_per_km'],
            'is_free' => $isFree,
            'route_description' => $validated['route_description'] ?? null,
            'service_details' => $validated['service_details'] ?? null,
            'vehicle_photo_url' => $photoPath,
            'status' => $validated['status'] ?? $transport->status ?? 'pending',
        ]);

        return response()->json([
            'message' => 'Transport updated successfully',
            'data' => $this->formatTransport($transport->fresh()),
        ]);
    }
}

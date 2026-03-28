<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Destination;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class DestinationController extends Controller
{
    private const MAX_IMAGE_SIZE_KB = 10240;
    private const REQUIRED_GALLERY_IMAGES = 4;

    private function normalizeImagePath(string $value): ?string
    {
        $normalized = str_replace('\\', '/', trim($value));

        if ($normalized === '') {
            return null;
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

        if ($normalized === '') {
            return null;
        }

        if (str_contains($normalized, '/storage/')) {
            $normalized = substr($normalized, strpos($normalized, '/storage/') + strlen('/storage/'));
        }

        $normalized = ltrim($normalized, '/');

        if (str_starts_with($normalized, 'storage/')) {
            $normalized = substr($normalized, strlen('storage/'));
        }

        if (str_starts_with($normalized, 'images/') || str_starts_with($normalized, 'destinations/')) {
            return $normalized;
        }

        return null;
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

    private function formatDestination(Destination $destination): array
    {
        $data = $destination->toArray();
        $data['image'] = $this->buildPublicImageUrl($destination->image);
        $images = is_array($destination->images) ? $destination->images : [];
        $data['images'] = array_values(array_filter(array_map(
            fn ($image) => $this->buildPublicImageUrl(is_string($image) ? $image : ''),
            $images
        )));

        return $data;
    }

    private function normalizeImageList($images): array
    {
        if (!is_array($images)) {
            return [];
        }

        $normalizedImages = [];

        foreach ($images as $image) {
            if (!is_string($image) || trim($image) === '') {
                continue;
            }

            $normalized = $this->normalizeImagePath($image);
            if ($normalized) {
                $normalizedImages[] = $normalized;
            }
        }

        return array_values(array_unique(array_filter($normalizedImages)));
    }

    private function normalizeUploadedFiles($imagesFiles): array
    {
        if (!$imagesFiles) {
            return [];
        }

        $imagesFiles = is_array($imagesFiles) ? $imagesFiles : [$imagesFiles];

        return array_values(array_filter(
            $imagesFiles,
            fn ($file) => $file instanceof UploadedFile
        ));
    }

    private function collectRequestedGalleryImages(Request $request): array
    {
        return array_values(array_unique(array_filter([
            ...$this->normalizeImageList($request->input('existing_images')),
            ...$this->normalizeImageList($request->input('images')),
        ])));
    }

    private function validateUploadedImageFiles(array $imagesFiles, string $field): void
    {
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
        $allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/pjpeg', 'image/png', 'image/webp'];

        foreach ($imagesFiles as $index => $file) {
            Validator::make(
                [$field => $file],
                [$field => 'file|max:' . self::MAX_IMAGE_SIZE_KB]
            )->validate();

            $clientExtension = strtolower((string) $file->getClientOriginalExtension());
            $mimeType = strtolower((string) $file->getMimeType());

            if (
                !in_array($clientExtension, $allowedExtensions, true) &&
                !in_array($mimeType, $allowedMimeTypes, true)
            ) {
                throw ValidationException::withMessages([
                    "{$field}.{$index}" => 'Only JPG, PNG, and WebP images are allowed.',
                ]);
            }
        }
    }

    private function ensureRequiredGalleryImages(array $galleryImages): void
    {
        if (count($galleryImages) !== self::REQUIRED_GALLERY_IMAGES) {
            throw ValidationException::withMessages([
                'images' => 'Please upload exactly 4 images.',
            ]);
        }
    }

    private function storeUploadedImages($imagesFiles): array
    {
        $imagesFiles = $this->normalizeUploadedFiles($imagesFiles);
        $storedImages = [];

        foreach ($imagesFiles as $file) {
            $storedImages[] = $file->store('images/destinations', 'public');
        }

        return array_values(array_unique(array_filter($storedImages)));
    }

    private function normalizeCoordinateValue($value): ?float
    {
        if ($value === null || $value === '') {
            return null;
        }

        return is_numeric($value) ? (float) $value : null;
    }

    private function filterDestinationAttributes(array $attributes): array
    {
        foreach (['latitude', 'longitude'] as $column) {
            if (!Schema::hasColumn('destinations', $column)) {
                unset($attributes[$column]);
            }
        }

        return $attributes;
    }
    /**
     * Get all destinations for the authenticated owner
     */
    public function index(): JsonResponse
    {
        try {
            $destinations = Destination::ownedBy((int) auth()->id())
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $destinations->map(fn (Destination $destination) => $this->formatDestination($destination)),
                'message' => 'Destinations retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve destinations: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created destination
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $rules = [
                'name' => 'required|string|max:255',
                'type' => 'required|string|max:255',
                'description' => 'nullable|string',
                'location' => 'required|string|max:255',
                'latitude' => 'nullable|numeric|between:-90,90',
                'longitude' => 'nullable|numeric|between:-180,180',
                'address' => 'nullable|string',
                'price' => 'required|numeric|min:0',
                'image' => 'nullable',
                'images' => 'nullable|array',
                'images.*' => 'nullable',
                'existing_images' => 'nullable|array',
                'existing_images.*' => 'nullable|string',
                'rating' => 'nullable|numeric|min:0|max:5',
                'status' => 'in:draft,active',
                'replace_gallery' => 'nullable|boolean',
            ];

            $validated = $request->validate($rules);
            if (empty($validated['status'])) {
                $validated['status'] = 'active';
            }
            // Default to active so new destinations show up for customers unless explicitly set to draft
            if (empty($validated['status'])) {
                $validated['status'] = 'active';
            }

            if ($request->hasFile('image')) {
                $this->validateUploadedImageFiles(
                    $this->normalizeUploadedFiles($request->file('image')),
                    'image'
                );
            }

            $imagesFiles = $this->normalizeUploadedFiles($request->file('images'));
            if ($imagesFiles) {
                $this->validateUploadedImageFiles($imagesFiles, 'images');
            }

            $imageInput = $request->input('image');
            if (is_string($imageInput) && trim($imageInput) !== '') {
                Validator::make(
                    ['image' => $imageInput],
                    ['image' => 'string']
                )->validate();
            }

            $existingImagesInput = $request->input('existing_images');
            if (is_array($existingImagesInput)) {
                Validator::make(
                    ['existing_images' => $existingImagesInput],
                    ['existing_images' => 'array', 'existing_images.*' => 'nullable|string']
                )->validate();
            }

            $legacyInputImages = $request->input('images');
            if (is_array($legacyInputImages)) {
                Validator::make(
                    ['images' => array_values(array_filter($legacyInputImages, fn ($image) => is_string($image) && trim($image) !== ''))],
                    ['images' => 'array', 'images.*' => 'nullable|string']
                )->validate();
            }

            $validated['owner_id'] = auth()->id();
            $validated['rating'] = $validated['rating'] ?? 0;
            $validated['total_bookings'] = 0;
            $validated['latitude'] = $this->normalizeCoordinateValue($validated['latitude'] ?? null);
            $validated['longitude'] = $this->normalizeCoordinateValue($validated['longitude'] ?? null);

            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('images/destinations', 'public');
                $validated['image'] = $path;
            } else {
                $imageInput = $request->input('image');
                if (is_string($imageInput) && trim($imageInput) !== '') {
                    $normalized = $this->normalizeImagePath($imageInput);
                    if ($normalized) {
                        $validated['image'] = $normalized;
                    }
                }
            }

            $existingImages = $this->collectRequestedGalleryImages($request);
            $uploadedImages = $this->storeUploadedImages($request->file('images'));
            $galleryImages = array_values(array_unique(array_filter([
                ...$existingImages,
                ...$uploadedImages,
            ])));

            // Gallery images are optional; if provided, store them.
            if (!empty($galleryImages)) {
                $validated['images'] = $galleryImages;
                if (empty($validated['image'])) {
                    $validated['image'] = $galleryImages[0];
                }
            }

            $validated = $this->filterDestinationAttributes($validated);
            $destination = Destination::create($validated);

            return response()->json([
                'success' => true,
                'data' => $this->formatDestination($destination),
                'message' => 'Destination created successfully'
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
                'message' => 'Validation failed'
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create destination: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a specific destination
     */
    public function show($destination): JsonResponse
    {
        try {
            Log::info('Show destination - Parameter received:', ['destination' => $destination]);

            if (is_null($destination) || $destination === '' || $destination === 'undefined') {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid destination ID'
                ], 400);
            }

            if (!is_numeric($destination)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid destination ID format'
                ], 400);
            }

            $destinationModel = Destination::find((int)$destination);

            if (!$destinationModel) {
                return response()->json([
                    'success' => false,
                    'message' => 'Destination not found'
                ], 404);
            }

            // Verify ownership
            if ($destinationModel->owner_id != auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            return response()->json([
                'success' => true,
                'data' => $this->formatDestination($destinationModel),
                'message' => 'Destination retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve destination: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a destination
     */
    public function update(Request $request, $destination): JsonResponse
    {
        try {
            Log::info('Update destination - Parameter received:', ['destination' => $destination]);

            $id = $destination;

            if (is_null($id) || $id === '' || $id === 'undefined') {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid destination ID'
                ], 400);
            }

            if (!is_numeric($id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid destination ID format'
                ], 400);
            }

            $destinationModel = Destination::find((int)$id);

            if (!$destinationModel) {
                return response()->json([
                    'success' => false,
                    'message' => 'Destination not found'
                ], 404);
            }

            // Verify ownership
            if ($destinationModel->owner_id != auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized - You do not own this destination'
                ], 403);
            }

            $rules = [
                'name' => 'string|max:255',
                'type' => 'string|max:255',
                'description' => 'nullable|string',
                'location' => 'string|max:255',
                'latitude' => 'nullable|numeric|between:-90,90',
                'longitude' => 'nullable|numeric|between:-180,180',
                'address' => 'nullable|string',
                'price' => 'numeric|min:0',
                'image' => 'nullable',
                'images' => 'nullable|array',
                'images.*' => 'nullable',
                'existing_images' => 'nullable|array',
                'existing_images.*' => 'nullable|string',
                'rating' => 'nullable|numeric|min:0|max:5',
                'status' => 'in:draft,active',
                'replace_gallery' => 'nullable|boolean',
            ];

            $validated = $request->validate($rules);

            if (array_key_exists('latitude', $validated)) {
                $validated['latitude'] = $this->normalizeCoordinateValue($validated['latitude']);
            }

            if (array_key_exists('longitude', $validated)) {
                $validated['longitude'] = $this->normalizeCoordinateValue($validated['longitude']);
            }

            if ($request->hasFile('image')) {
                $this->validateUploadedImageFiles(
                    $this->normalizeUploadedFiles($request->file('image')),
                    'image'
                );
            }

            $imagesFiles = $this->normalizeUploadedFiles($request->file('images'));
            if ($imagesFiles) {
                $this->validateUploadedImageFiles($imagesFiles, 'images');
            }

            $imageInput = $request->input('image');
            if (is_string($imageInput) && trim($imageInput) !== '') {
                Validator::make(
                    ['image' => $imageInput],
                    ['image' => 'string']
                )->validate();
            }

            $existingImagesInput = $request->input('existing_images');
            if (is_array($existingImagesInput)) {
                Validator::make(
                    ['existing_images' => $existingImagesInput],
                    ['existing_images' => 'array', 'existing_images.*' => 'nullable|string']
                )->validate();
            }

            $legacyInputImages = $request->input('images');
            if (is_array($legacyInputImages)) {
                Validator::make(
                    ['images' => array_values(array_filter($legacyInputImages, fn ($image) => is_string($image) && trim($image) !== ''))],
                    ['images' => 'array', 'images.*' => 'nullable|string']
                )->validate();
            }

            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('images/destinations', 'public');
                $validated['image'] = $path;
            } else {
                $imageInput = $request->input('image');
                if (is_string($imageInput) && trim($imageInput) !== '') {
                    $normalized = $this->normalizeImagePath($imageInput);
                    if ($normalized) {
                        $validated['image'] = $normalized;
                    } else {
                        unset($validated['image']);
                    }
                } else if ($request->boolean('replace_gallery')) {
                    $validated['image'] = null;
                } else {
                    unset($validated['image']);
                }
            }

            $existingImages = $this->collectRequestedGalleryImages($request);
            $uploadedImages = $this->storeUploadedImages($request->file('images'));
            $galleryImages = array_values(array_unique(array_filter([
                ...$existingImages,
                ...$uploadedImages,
            ])));

            // Gallery images are optional; if provided, store them.
            if (!empty($galleryImages)) {
                $validated['images'] = $galleryImages;
                $validated['image'] = $galleryImages[0];
            } else if ($request->boolean('replace_gallery')) {
                $validated['images'] = [];
                $validated['image'] = null;
            } else if (!array_key_exists('image', $validated) || empty($validated['image'])) {
                unset($validated['image']);
            }
            if (!$request->boolean('replace_gallery') && empty($galleryImages)) {
                unset($validated['images']);
            }

            $validated = $this->filterDestinationAttributes($validated);
            $destinationModel->update($validated);

            return response()->json([
                'success' => true,
                'data' => $this->formatDestination($destinationModel->fresh()),
                'message' => 'Destination updated successfully'
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
                'message' => 'Validation failed'
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update destination: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a destination
     */
    public function destroy($destination): JsonResponse
    {
        try {
            Log::info('Delete destination - Raw parameter received:', ['destination' => $destination, 'type' => gettype($destination)]);

            // Handle the ID parameter more carefully
            $id = $destination;
            
            Log::info('Delete destination - Processing ID:', ['id' => $id]);

            if (is_null($id) || $id === '' || $id === 'undefined') {
                Log::error('Delete destination - Invalid ID received:', ['id' => $id]);
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid destination ID'
                ], 400);
            }

            if (!is_numeric($id)) {
                Log::error('Delete destination - ID not numeric:', ['id' => $id, 'type' => gettype($id)]);
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid destination ID format'
                ], 400);
            }

            $destinationModel = Destination::find((int)$id);

            if (!$destinationModel) {
                Log::warning('Delete destination - Destination not found:', ['id' => $id]);
                return response()->json([
                    'success' => false,
                    'message' => 'Destination not found'
                ], 404);
            }

            // Verify ownership
            if ($destinationModel->owner_id != auth()->id()) {
                Log::warning('Delete destination - Unauthorized:', ['id' => $id, 'owner_id' => $destinationModel->owner_id, 'auth_id' => auth()->id()]);
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized - You do not own this destination'
                ], 403);
            }

            $destinationModel->delete();

            Log::info('Delete destination - Success:', ['id' => $id]);

            return response()->json([
                'success' => true,
                'message' => 'Destination deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Delete destination - Exception:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete destination: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all public destinations (for customers)
     */
    public function getAllPublic(): JsonResponse
    {
        try {
            // Include records that are explicitly active or have no status set (backward compatibility)
            $destinations = Destination::where(function ($query) {
                    $query->where('status', 'active')
                        ->orWhereNull('status');
                })
                ->orderByDesc('created_at')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $destinations->map(function (Destination $destination) {
                    $formatted = $this->formatDestination($destination);

                    // Add promotion data, but never let promotion failures break the public feed
                    try {
                        $promotionInfo = \App\Services\PromotionService::getBestPromotionForDestination(
                            floatval($destination->price),
                            $destination->destination_id
                        );

                        $formatted['original_price'] = $promotionInfo['original_price'];
                        $formatted['discounted_price'] = $promotionInfo['discounted_price'];
                        $formatted['discount_amount'] = $promotionInfo['discount_amount'];
                        $formatted['discount_percentage'] = $promotionInfo['discount_percentage'];
                        $formatted['has_promotion'] = $promotionInfo['promotion'] !== null;
                        $formatted['promotion'] = $promotionInfo['promotion'];
                    } catch (\Throwable $e) {
                        $formatted['original_price'] = floatval($destination->price);
                        $formatted['discounted_price'] = floatval($destination->price);
                        $formatted['discount_amount'] = 0;
                        $formatted['discount_percentage'] = 0;
                        $formatted['has_promotion'] = false;
                        $formatted['promotion'] = null;
                        \Log::warning('Promotion lookup failed for destination', [
                            'destination_id' => $destination->destination_id,
                            'error' => $e->getMessage(),
                        ]);
                    }

                    return $formatted;
                }),
                'message' => 'Public destinations retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve destinations: ' . $e->getMessage()
            ], 500);
        }
    }
}

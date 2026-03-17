<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Destination;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DestinationController extends Controller
{
    /**
     * Get all destinations for the authenticated owner
     */
    public function index(): JsonResponse
    {
        try {
            $destinations = Destination::where('user_id', auth()->id())
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $destinations,
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
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'type' => 'required|string|max:255',
                'description' => 'nullable|string',
                'location' => 'required|string|max:255',
                'address' => 'nullable|string',
                'price' => 'required|numeric|min:0',
                'image' => 'nullable|string',
                'images' => 'nullable|array',
                'images.*' => 'string',
                'rating' => 'nullable|numeric|min:0|max:5',
                'status' => 'in:draft,active'
            ]);

            $validated['user_id'] = auth()->id();
            $validated['rating'] = $validated['rating'] ?? 0;
            $validated['total_bookings'] = 0;

            $destination = Destination::create($validated);

            return response()->json([
                'success' => true,
                'data' => $destination,
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
            \Log::info('Show destination - Parameter received:', ['destination' => $destination]);

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
            if ($destinationModel->user_id != auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            return response()->json([
                'success' => true,
                'data' => $destinationModel,
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
            \Log::info('Update destination - Parameter received:', ['destination' => $destination]);

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
            if ($destinationModel->user_id != auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized - You do not own this destination'
                ], 403);
            }

            $validated = $request->validate([
                'name' => 'string|max:255',
                'type' => 'string|max:255',
                'description' => 'nullable|string',
                'location' => 'string|max:255',
                'address' => 'nullable|string',
                'price' => 'numeric|min:0',
                'image' => 'nullable|string',
                'images' => 'nullable|array',
                'images.*' => 'string',
                'rating' => 'nullable|numeric|min:0|max:5',
                'status' => 'in:draft,active'
            ]);

            $destinationModel->update($validated);

            return response()->json([
                'success' => true,
                'data' => $destinationModel->fresh(),
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
            \Log::info('Delete destination - Raw parameter received:', ['destination' => $destination, 'type' => gettype($destination)]);

            // Handle the ID parameter more carefully
            $id = $destination;
            
            \Log::info('Delete destination - Processing ID:', ['id' => $id]);

            if (is_null($id) || $id === '' || $id === 'undefined') {
                \Log::error('Delete destination - Invalid ID received:', ['id' => $id]);
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid destination ID'
                ], 400);
            }

            if (!is_numeric($id)) {
                \Log::error('Delete destination - ID not numeric:', ['id' => $id, 'type' => gettype($id)]);
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid destination ID format'
                ], 400);
            }

            $destinationModel = Destination::find((int)$id);

            if (!$destinationModel) {
                \Log::warning('Delete destination - Destination not found:', ['id' => $id]);
                return response()->json([
                    'success' => false,
                    'message' => 'Destination not found'
                ], 404);
            }

            // Verify ownership
            if ($destinationModel->user_id != auth()->id()) {
                \Log::warning('Delete destination - Unauthorized:', ['id' => $id, 'owner_id' => $destinationModel->user_id, 'auth_id' => auth()->id()]);
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized - You do not own this destination'
                ], 403);
            }

            $destinationModel->delete();

            \Log::info('Delete destination - Success:', ['id' => $id]);

            return response()->json([
                'success' => true,
                'message' => 'Destination deleted successfully'
            ]);
        } catch (\Exception $e) {
            \Log::error('Delete destination - Exception:', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
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
            $destinations = Destination::where('status', 'active')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $destinations,
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


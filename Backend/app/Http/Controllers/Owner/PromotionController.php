<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use App\Models\PromotionLink;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PromotionController extends Controller
{
    public function index()
    {
        $userId = auth()->id();

        $promotions = Promotion::where('owner_id', $userId)
            ->with('promotionLinks')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($promotion) {
                $data = $promotion->toArray();
                $data['linked_destinations'] = $promotion->promotionLinks
                    ->where('link_type', 'destination')
                    ->pluck('link_id')
                    ->values()
                    ->toArray();
                $data['linked_transports'] = $promotion->promotionLinks
                    ->where('link_type', 'transport')
                    ->pluck('link_id')
                    ->values()
                    ->toArray();
                return $data;
            });

        return response()->json([
            'success' => true,
            'data' => $promotions
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'discount' => 'required|string',
                'type' => 'required|string',
                'expiry' => 'nullable|date|after_or_equal:today',
                'is_active' => 'nullable|boolean',
                'service_category' => 'nullable|string|in:hotel,transport',
                'linked_destinations' => 'nullable|array',
                'linked_destinations.*' => 'integer|exists:destinations,id',
                'linked_transports' => 'nullable|array',
                'linked_transports.*' => 'integer|exists:transports,transport_id',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        }

        $validated['owner_id'] = auth()->id();

        // Extract linked items before creating promotion
        $linkedDestinations = $validated['linked_destinations'] ?? [];
        $linkedTransports = $validated['linked_transports'] ?? [];
        unset($validated['linked_destinations'], $validated['linked_transports']);

        DB::beginTransaction();
        try {
            $promotion = Promotion::create($validated);

            // Create links for destinations
            foreach ($linkedDestinations as $destinationId) {
                PromotionLink::create([
                    'promotion_id' => $promotion->id,
                    'link_type' => 'destination',
                    'link_id' => $destinationId,
                ]);
            }

            // Create links for transports
            foreach ($linkedTransports as $transportId) {
                PromotionLink::create([
                    'promotion_id' => $promotion->id,
                    'link_type' => 'transport',
                    'link_id' => $transportId,
                ]);
            }

            DB::commit();

            // Load the promotion with links for response
            $promotion->load('promotionLinks');
            $data = $promotion->toArray();
            $data['linked_destinations'] = $linkedDestinations;
            $data['linked_transports'] = $linkedTransports;

            return response()->json([
                'success' => true,
                'message' => 'Promotion created successfully',
                'data' => $data
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Promotion creation error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to create promotion: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(string $id)
    {
        $userId = auth()->id();

        $promotion = Promotion::where('owner_id', $userId)
            ->with('promotionLinks')
            ->findOrFail($id);

        $data = $promotion->toArray();
        $data['linked_destinations'] = $promotion->promotionLinks
            ->where('link_type', 'destination')
            ->pluck('link_id')
            ->values()
            ->toArray();
        $data['linked_transports'] = $promotion->promotionLinks
            ->where('link_type', 'transport')
            ->pluck('link_id')
            ->values()
            ->toArray();

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function update(Request $request, string $id)
    {
        $userId = auth()->id();

        $promotion = Promotion::where('owner_id', $userId)->findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'discount' => 'sometimes|string',
            'type' => 'sometimes|string',
            'expiry' => 'nullable|date|after_or_equal:today',
            'is_active' => 'nullable|boolean',
            'service_category' => 'nullable|string|in:hotel,transport',
            'linked_destinations' => 'nullable|array',
            'linked_destinations.*' => 'integer|exists:destinations,id',
            'linked_transports' => 'nullable|array',
            'linked_transports.*' => 'integer|exists:transports,transport_id',
        ]);

        // Extract linked items before updating promotion
        $linkedDestinations = $validated['linked_destinations'] ?? null;
        $linkedTransports = $validated['linked_transports'] ?? null;
        unset($validated['linked_destinations'], $validated['linked_transports']);

        DB::beginTransaction();
        try {
            $promotion->update($validated);

            // Update destination links if provided
            if ($linkedDestinations !== null) {
                // Remove existing destination links
                $promotion->promotionLinks()->where('link_type', 'destination')->delete();
                // Create new links
                foreach ($linkedDestinations as $destinationId) {
                    PromotionLink::create([
                        'promotion_id' => $promotion->id,
                        'link_type' => 'destination',
                        'link_id' => $destinationId,
                    ]);
                }
            }

            // Update transport links if provided
            if ($linkedTransports !== null) {
                // Remove existing transport links
                $promotion->promotionLinks()->where('link_type', 'transport')->delete();
                // Create new links
                foreach ($linkedTransports as $transportId) {
                    PromotionLink::create([
                        'promotion_id' => $promotion->id,
                        'link_type' => 'transport',
                        'link_id' => $transportId,
                    ]);
                }
            }

            DB::commit();

            // Load the promotion with links for response
            $promotion->load('promotionLinks');
            $data = $promotion->toArray();
            $data['linked_destinations'] = $promotion->promotionLinks
                ->where('link_type', 'destination')
                ->pluck('link_id')
                ->values()
                ->toArray();
            $data['linked_transports'] = $promotion->promotionLinks
                ->where('link_type', 'transport')
                ->pluck('link_id')
                ->values()
                ->toArray();

            return response()->json([
                'success' => true,
                'message' => 'Promotion updated successfully',
                'data' => $data
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update promotion: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy(string $id)
    {
        $userId = auth()->id();

        $promotion = Promotion::where('owner_id', $userId)->findOrFail($id);

        DB::beginTransaction();
        try {
            // Delete all linked items first
            $promotion->promotionLinks()->delete();
            // Delete the promotion
            $promotion->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Promotion deleted successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete promotion: ' . $e->getMessage()
            ], 500);
        }
    }
}

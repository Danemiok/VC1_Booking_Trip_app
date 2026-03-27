<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use App\Models\PromotionLink;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PromotionController extends Controller
{
    private function resolvePromotionRange(Promotion $promotion): array
    {
        $start = $promotion->start_date
            ? Carbon::parse($promotion->start_date)->startOfDay()
            : ($promotion->created_at ? $promotion->created_at->copy()->startOfDay() : null);

        $end = $promotion->end_date
            ? Carbon::parse($promotion->end_date)->endOfDay()
            : ($promotion->expiry ? Carbon::parse($promotion->expiry)->endOfDay() : null);

        return [$start, $end];
    }

    private function findOverlappingPromotion(
        array $linkedDestinations,
        array $linkedTransports,
        ?string $startDate,
        ?string $endDate,
        ?int $excludePromotionId = null
    ): ?Promotion {
        if (empty($linkedDestinations) && empty($linkedTransports)) {
            return null;
        }

        $ownerId = auth()->id();
        $newStart = $startDate ? Carbon::parse($startDate)->startOfDay() : null;
        $newEnd = $endDate ? Carbon::parse($endDate)->endOfDay() : null;

        if (!$newStart || !$newEnd) {
            return null;
        }

        $promotions = Promotion::where('owner_id', $ownerId)
            ->where('is_active', true)
            ->when($excludePromotionId, fn ($q) => $q->where('id', '!=', $excludePromotionId))
            ->whereHas('promotionLinks', function ($q) use ($linkedDestinations, $linkedTransports) {
                $q->where(function ($sub) use ($linkedDestinations, $linkedTransports) {
                    if (!empty($linkedDestinations)) {
                        $sub->orWhere(function ($inner) use ($linkedDestinations) {
                            $inner->where('link_type', 'destination')
                                  ->whereIn('link_id', $linkedDestinations);
                        });
                    }

                    if (!empty($linkedTransports)) {
                        $sub->orWhere(function ($inner) use ($linkedTransports) {
                            $inner->where('link_type', 'transport')
                                  ->whereIn('link_id', $linkedTransports);
                        });
                    }
                });
            })
            ->get();

        $newEndOrMax = $newEnd ?? Carbon::parse('9999-12-31')->endOfDay();

        foreach ($promotions as $promotion) {
            [$existingStart, $existingEnd] = $this->resolvePromotionRange($promotion);
            $existingStart = $existingStart ?? Carbon::parse('1970-01-01')->startOfDay();
            $existingEnd = $existingEnd ?? Carbon::parse('9999-12-31')->endOfDay();

            if ($existingStart->lessThanOrEqualTo($newEndOrMax) && $existingEnd->greaterThanOrEqualTo($newStart)) {
                return $promotion;
            }
        }

        return null;
    }

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
                'start_date' => 'required|date|after_or_equal:today',
                'end_date' => 'required|date|after_or_equal:start_date',
                'expiry' => 'nullable|date',
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
        $validated['expiry'] = $validated['end_date'] ?? ($validated['expiry'] ?? null);

        // Extract linked items before creating promotion
        $linkedDestinations = $validated['linked_destinations'] ?? [];
        $linkedTransports = $validated['linked_transports'] ?? [];
        unset($validated['linked_destinations'], $validated['linked_transports']);

        $conflict = $this->findOverlappingPromotion(
            $linkedDestinations,
            $linkedTransports,
            $validated['start_date'] ?? null,
            $validated['end_date'] ?? null
        );

        if ($conflict) {
            return response()->json([
                'success' => false,
                'message' => 'A promotion is already active for one or more selected items. Please wait until the current promotion ends.',
                'errors' => [
                    'overlap' => ['One or more selected items already have an active promotion in this date range.']
                ],
            ], 422);
        }

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
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'expiry' => 'nullable|date',
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

        $nextLinkedDestinations = $linkedDestinations ?? $promotion->promotionLinks()
            ->where('link_type', 'destination')
            ->pluck('link_id')
            ->values()
            ->toArray();

        $nextLinkedTransports = $linkedTransports ?? $promotion->promotionLinks()
            ->where('link_type', 'transport')
            ->pluck('link_id')
            ->values()
            ->toArray();

        $nextStartDate = $validated['start_date']
            ?? $promotion->start_date
            ?? ($promotion->created_at ? $promotion->created_at->toDateString() : null);
        $nextEndDate = $validated['end_date'] ?? $promotion->end_date ?? $promotion->expiry;
        $nextExpiry = $validated['end_date'] ?? ($validated['expiry'] ?? $promotion->expiry);
        $nextIsActive = $validated['is_active'] ?? $promotion->is_active;

        if ($nextIsActive) {
            $conflict = $this->findOverlappingPromotion(
                $nextLinkedDestinations,
                $nextLinkedTransports,
                $nextStartDate ? (string) $nextStartDate : null,
                $nextEndDate ? (string) $nextEndDate : null,
                (int) $promotion->id
            );

            if ($conflict) {
                return response()->json([
                    'success' => false,
                    'message' => 'A promotion is already active for one or more selected items. Please wait until the current promotion ends.',
                    'errors' => [
                        'overlap' => ['One or more selected items already have an active promotion in this date range.']
                    ],
                ], 422);
            }
        }

        DB::beginTransaction();
        try {
            if (array_key_exists('end_date', $validated)) {
                $validated['expiry'] = $validated['end_date'];
            }
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

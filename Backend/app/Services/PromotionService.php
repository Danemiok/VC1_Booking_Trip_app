<?php

namespace App\Services;

use App\Models\Promotion;

/**
 * Service to handle promotion-related logic, especially for customer-facing views
 */
class PromotionService
{
    /**
     * Get active promotions for a specific destination
     */
    public static function getActivePromotionsForDestination(int $destinationId): array
    {
        return Promotion::whereHas('promotionLinks', function ($query) use ($destinationId) {
            $query->where('link_type', 'destination')
                  ->where('link_id', $destinationId);
        })
        ->where('is_active', true)
        ->get()
        ->filter(fn($promo) => $promo->isCurrentlyActive())
        ->map(fn($promo) => [
            'id' => $promo->id,
            'title' => $promo->title,
            'description' => $promo->description,
            'discount' => $promo->discount,
            'type' => $promo->type,
            'expiry' => $promo->expiry,
        ])
        ->values()
        ->toArray();
    }

    /**
     * Get active promotions for a specific transport
     */
    public static function getActivePromotionsForTransport(int $transportId): array
    {
        return Promotion::whereHas('promotionLinks', function ($query) use ($transportId) {
            $query->where('link_type', 'transport')
                  ->where('link_id', $transportId);
        })
        ->where('is_active', true)
        ->get()
        ->filter(fn($promo) => $promo->isCurrentlyActive())
        ->map(fn($promo) => [
            'id' => $promo->id,
            'title' => $promo->title,
            'description' => $promo->description,
            'discount' => $promo->discount,
            'type' => $promo->type,
            'expiry' => $promo->expiry,
        ])
        ->values()
        ->toArray();
    }

    /**
     * Get the best active promotion discount for a destination (applies the maximum discount)
     */
    public static function getBestPromotionForDestination(float $basePrice, int $destinationId): array
    {
        $promotions = Promotion::whereHas('promotionLinks', function ($query) use ($destinationId) {
            $query->where('link_type', 'destination')
                  ->where('link_id', $destinationId);
        })
        ->where('is_active', true)
        ->get()
        ->filter(fn($promo) => $promo->isCurrentlyActive());

        if ($promotions->isEmpty()) {
            return [
                'original_price' => $basePrice,
                'discounted_price' => $basePrice,
                'discount_amount' => 0,
                'discount_percentage' => 0,
                'promotion' => null,
            ];
        }

        // Find the promotion with the maximum discount
        $bestPromotion = null;
        $maxDiscount = 0;

        foreach ($promotions as $promo) {
            $discountedPrice = $promo->applyDiscount($basePrice);
            $discount = $basePrice - $discountedPrice;
            
            if ($discount > $maxDiscount) {
                $maxDiscount = $discount;
                $bestPromotion = $promo;
            }
        }

        if (!$bestPromotion) {
            return [
                'original_price' => $basePrice,
                'discounted_price' => $basePrice,
                'discount_amount' => 0,
                'discount_percentage' => 0,
                'promotion' => null,
            ];
        }

        $discountedPrice = $bestPromotion->applyDiscount($basePrice);

        return [
            'original_price' => $basePrice,
            'discounted_price' => $discountedPrice,
            'discount_amount' => $maxDiscount,
            'discount_percentage' => round(($maxDiscount / $basePrice) * 100, 2),
            'promotion' => [
                'id' => $bestPromotion->id,
                'title' => $bestPromotion->title,
                'description' => $bestPromotion->description,
                'discount' => $bestPromotion->discount,
                'type' => $bestPromotion->type,
                'expiry' => $bestPromotion->expiry,
            ],
        ];
    }

    /**
     * Get the best active promotion discount for a transport
     */
    public static function getBestPromotionForTransport(float $basePrice, int $transportId): array
    {
        $promotions = Promotion::whereHas('promotionLinks', function ($query) use ($transportId) {
            $query->where('link_type', 'transport')
                  ->where('link_id', $transportId);
        })
        ->where('is_active', true)
        ->get()
        ->filter(fn($promo) => $promo->isCurrentlyActive());

        if ($promotions->isEmpty()) {
            return [
                'original_price' => $basePrice,
                'discounted_price' => $basePrice,
                'discount_amount' => 0,
                'discount_percentage' => 0,
                'promotion' => null,
            ];
        }

        // Find the promotion with the maximum discount
        $bestPromotion = null;
        $maxDiscount = 0;

        foreach ($promotions as $promo) {
            $discountedPrice = $promo->applyDiscount($basePrice);
            $discount = $basePrice - $discountedPrice;
            
            if ($discount > $maxDiscount) {
                $maxDiscount = $discount;
                $bestPromotion = $promo;
            }
        }

        if (!$bestPromotion) {
            return [
                'original_price' => $basePrice,
                'discounted_price' => $basePrice,
                'discount_amount' => 0,
                'discount_percentage' => 0,
                'promotion' => null,
            ];
        }

        $discountedPrice = $bestPromotion->applyDiscount($basePrice);

        return [
            'original_price' => $basePrice,
            'discounted_price' => $discountedPrice,
            'discount_amount' => $maxDiscount,
            'discount_percentage' => round(($maxDiscount / $basePrice) * 100, 2),
            'promotion' => [
                'id' => $bestPromotion->id,
                'title' => $bestPromotion->title,
                'description' => $bestPromotion->description,
                'discount' => $bestPromotion->discount,
                'type' => $bestPromotion->type,
                'expiry' => $bestPromotion->expiry,
            ],
        ];
    }
}

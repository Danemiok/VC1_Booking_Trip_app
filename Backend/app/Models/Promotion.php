<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Promotion extends Model
{
    use HasFactory;

    protected $fillable = [
        'owner_id',
        'title',
        'description',
        'discount',
        'type',
        'start_date',
        'end_date',
        'expiry',
        'is_active',
        'service_category'
    ];

    /**
     * Get the links for this promotion.
     */
    public function promotionLinks(): HasMany
    {
        return $this->hasMany(PromotionLink::class);
    }

    /**
     * Get linked destinations.
     */
    public function linkedDestinations()
    {
        return $this->promotionLinks()->where('link_type', 'destination')->get();
    }

    /**
     * Get linked transports.
     */
    public function linkedTransports()
    {
        return $this->promotionLinks()->where('link_type', 'transport')->get();
    }

    /**
     * Check if promotion is currently active based on dates.
     */
    public function isCurrentlyActive(): bool
    {
        if (!$this->is_active) {
            return false;
        }
        
        $now = now();

        $startDate = $this->start_date
            ? \Carbon\Carbon::parse($this->start_date)->startOfDay()
            : ($this->created_at ? $this->created_at->copy()->startOfDay() : null);

        $endDate = $this->end_date
            ? \Carbon\Carbon::parse($this->end_date)->endOfDay()
            : ($this->expiry ? \Carbon\Carbon::parse($this->expiry)->endOfDay() : null);

        if ($startDate && $now->lessThan($startDate)) {
            return false;
        }

        if ($endDate && $now->greaterThan($endDate)) {
            return false;
        }

        return true;
    }

    /**
     * Check if this promotion applies to a specific item.
     */
    public function appliesTo(string $linkType, int $linkId): bool
    {
        if (!$this->isCurrentlyActive()) {
            return false;
        }
        
        return $this->promotionLinks()
            ->where('link_type', $linkType)
            ->where('link_id', $linkId)
            ->exists();
    }

    /**
     * Calculate discounted price.
     */
    public function applyDiscount(float $basePrice): float
    {
        $discount = $this->discount;
        
        if (!$discount) {
            return $basePrice;
        }
        
        $trimmed = trim($discount);
        
        // Percentage discount (e.g., "20%")
        if (str_ends_with($trimmed, '%')) {
            $pct = (float) str_replace('%', '', $trimmed);
            if ($pct > 0) {
                return max(0, $basePrice - ($basePrice * $pct / 100));
            }
        }
        
        // Fixed amount discount (e.g., "$20" or "20")
        if (str_starts_with($trimmed, '$')) {
            $amount = (float) str_replace('$', '', $trimmed);
            if ($amount > 0) {
                return max(0, $basePrice - $amount);
            }
        }
        
        // Plain number (treat as percentage)
        $num = (float) $trimmed;
        if ($num > 0 && $num <= 100) {
            return max(0, $basePrice - ($basePrice * $num / 100));
        }
        
        return $basePrice;
    }
}

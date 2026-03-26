<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PromotionLink extends Model
{
    use HasFactory;

    protected $fillable = [
        'promotion_id',
        'link_type',
        'link_id',
    ];

    /**
     * Get the promotion that owns this link.
     */
    public function promotion(): BelongsTo
    {
        return $this->belongsTo(Promotion::class);
    }

    /**
     * Scope for destination links.
     */
    public function scopeDestinations($query)
    {
        return $query->where('link_type', 'destination');
    }

    /**
     * Scope for transport links.
     */
    public function scopeTransports($query)
    {
        return $query->where('link_type', 'transport');
    }
}

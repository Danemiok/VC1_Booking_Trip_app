<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Schema;

class Destination extends Model
{
    private static ?string $ownerForeignKey = null;

    protected $primaryKey = 'destination_id';

    protected $keyType = 'int';

    public $incrementing = true;

    protected $appends = ['id'];

    protected $fillable = [
        'owner_id',
        'user_id',
        'name',
        'type',
        'description',
        'location',
        'latitude',
        'longitude',
        'address',
        'price',
        'image',
        'images',
        'rating',
        'total_bookings',
        'status'
    ];

    protected $casts = [
        'images' => 'array',
        'price' => 'decimal:2',
        'rating' => 'decimal:1',
        'total_bookings' => 'integer',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    public static function ownerForeignKey(): string
    {
        if (self::$ownerForeignKey !== null) {
            return self::$ownerForeignKey;
        }

        return self::$ownerForeignKey = Schema::hasColumn('destinations', 'owner_id')
            ? 'owner_id'
            : 'user_id';
    }

    public function scopeOwnedBy(Builder $query, int $ownerId): Builder
    {
        return $query->where($this->qualifyColumn(self::ownerForeignKey()), $ownerId);
    }

    public function setUserIdAttribute($value): void
    {
        $this->attributes[self::ownerForeignKey()] = $value;
    }

    public function getUserIdAttribute(): ?int
    {
        $value = $this->attributes[self::ownerForeignKey()] ?? null;

        return $value === null ? null : (int) $value;
    }

    public function setOwnerIdAttribute($value): void
    {
        $this->attributes[self::ownerForeignKey()] = $value;
    }

    public function getOwnerIdAttribute(): ?int
    {
        $value = $this->attributes[self::ownerForeignKey()] ?? null;

        return $value === null ? null : (int) $value;
    }

    public function getIdAttribute(): ?int
    {
        $value = $this->getAttribute('destination_id');

        return $value === null ? null : (int) $value;
    }

    /**
     * Get the user that owns this destination
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, self::ownerForeignKey());
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, self::ownerForeignKey());
    }

    /**
     * Get all bookings for this destination
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }
}

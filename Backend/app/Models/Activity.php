<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Activity extends Model
{
    protected $fillable = [
        'destination_id',
        'name',
        'description',
        'type',
        'price',
        'duration_hours',
        'image',
        'rating',
        'available_spots',
    ];

    protected $casts = [
        'destination_id' => 'integer',
        'price' => 'decimal:2',
        'duration_hours' => 'integer',
        'rating' => 'decimal:1',
        'available_spots' => 'integer',
    ];

    public function destination(): BelongsTo
    {
        return $this->belongsTo(Destination::class);
    }
}

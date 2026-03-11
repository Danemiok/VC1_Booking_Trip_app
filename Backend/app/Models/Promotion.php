<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Promotion extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'description',
        'discount',
        'type',
        'image',
        'expiry',
        'code',
        'color',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
        'expiry' => 'date',
    ];

    /**
     * Get the status attribute (for compatibility)
     */
    public function getStatusAttribute()
    {
        return $this->is_active ? 'active' : 'expired';
    }
}

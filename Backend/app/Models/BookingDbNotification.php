<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookingDbNotification extends Model
{
    protected $table = 'notifications';

    protected $fillable = [
        'user_id',
        'booking_id',
        'type',
        'title',
        'message',
        'is_read',
        'data',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'data' => 'array',
    ];
    
    public $timestamps = true;
}

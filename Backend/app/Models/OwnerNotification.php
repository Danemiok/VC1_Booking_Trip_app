<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OwnerNotification extends Model
{
    protected $table = 'owner_notifications';

    protected $fillable = [
        'user_id',
        'booking_id',
        'title',
        'message',
        'data',
        'read_at',
    ];

    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}


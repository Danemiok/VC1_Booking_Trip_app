<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $table = 'bookings';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'user_id',
        'guest',
        'customer_email',
        'customer_phone',
        'service',
        'route',
        'category',
        'date_start',
        'date_end',
        'date',
        'time',
        'pax',
        'guests',
        'nights',
        'room_type',
        'vehicle_type',
        'amount',
        'total_amount',
        'payment_method',
        'status',
        'rental',
        'activities',
        'reference',
        'special_requests',
        'destination_id',
        'transport_id',
        // Legacy camelCase columns (kept for backwards compatibility with earlier migrations).
        'dateStart',
        'dateEnd',
        'roomType',
        'vehicleType',
        'customerEmail',
        'customerPhone',
        'specialRequests',
        'paymentMethod',
        'createdAt',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'pax' => 'integer',
        'nights' => 'integer',
        'destination_id' => 'integer',
        'transport_id' => 'integer',
        'rental' => 'array',
        'activities' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'createdAt' => 'datetime',
    ];

    // Relationship with User
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

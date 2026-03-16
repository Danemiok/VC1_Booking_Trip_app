<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hotel;

class HotelController extends Controller
{
    /**
     * Public list of active hotels with owner info.
     */
    public function index()
    {
        $hotels = Hotel::query()
            ->where('is_active', true)
            ->with(['owner:id,name,email'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json($hotels);
    }
}

<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Message;
use App\Models\User;
class MessageController extends Controller
{

    public function index()
    {
        $ownerId = auth()->id();

        $messages = Message::where(function ($q) use ($ownerId) {
            $q->where('sender_id', $ownerId)
              ->orWhere('receiver_id', $ownerId);
        })
        ->with(['sender', 'receiver'])
        ->latest()
        ->get()
        ->map(function ($m) use ($ownerId) {
            $m->is_unread = $m->receiver_id == $ownerId && !$m->read_at;
            return $m;
        });

        return response()->json($messages);
    }

    public function unreadCount()
    {
        $ownerId = auth()->id();
        $count = Message::where('receiver_id', $ownerId)
            ->whereNull('read_at')
            ->count();

        return response()->json(['unread_count' => $count]);
    }

    public function conversation($customerId)
    {
        $ownerId = auth()->id();

        // Mark incoming messages as read
        Message::where('sender_id', $customerId)
            ->where('receiver_id', $ownerId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $messages = Message::where(function ($q) use ($ownerId, $customerId) {
            $q->where('sender_id', $ownerId)
              ->where('receiver_id', $customerId);
        })
        ->orWhere(function ($q) use ($ownerId, $customerId) {
            $q->where('sender_id', $customerId)
              ->where('receiver_id', $ownerId);
        })
        ->orderBy('created_at', 'asc') // Standard chat: Oldest at top, newest at bottom
        ->get();

        return response()->json($messages);
    }

    public function send(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'message' => 'required'
        ]);

        $message = Message::create([
            'sender_id' => auth()->id(),
            'receiver_id' => $request->receiver_id,
            'message' => $request->message
        ]);

        return response()->json($message);
    }

    public function findCustomerByEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $email = strtolower($request->input('email'));

        $customer = User::whereRaw('LOWER(email) = ?', [$email])
            ->where('role', 'customer')
            ->first();

        if (!$customer) {
            return response()->json(['message' => 'Customer not found.'], 404);
        }

        return response()->json([
            'customer' => $customer,
        ]);
    }
}

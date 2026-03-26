<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Message;
use App\Models\User;

class MessageController extends Controller
{
    /**
     * List all conversations/messages for the authenticated customer.
     */
    public function index()
    {
        $userId = auth()->id();
        $messages = Message::where('sender_id', $userId)
            ->orWhere('receiver_id', $userId)
            ->with(['sender', 'receiver'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($m) use ($userId) {
                $m->is_unread = $m->receiver_id == $userId && !$m->read_at;
                return $m;
            });

        return response()->json([
            'success' => true,
            'messages' => $messages
        ]);
    }

    public function unreadCount()
    {
        $userId = auth()->id();
        $count = Message::where('receiver_id', $userId)
            ->whereNull('read_at')
            ->count();

        return response()->json(['unread_count' => $count]);
    }

    /**
     * Show conversation with a specific owner.
     */
    public function conversation($ownerId)
    {
        $userId = auth()->id();
        $owner = User::findOrFail($ownerId);

        // Mark incoming messages as read
        Message::where('sender_id', $ownerId)
            ->where('receiver_id', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $conversation = Message::where(function ($q) use ($ownerId, $userId) {
                $q->where('sender_id', $userId)
                  ->where('receiver_id', $ownerId);
            })
            ->orWhere(function ($q) use ($ownerId, $userId) {
                $q->where('sender_id', $ownerId)
                  ->where('receiver_id', $userId);
            })
            ->orderBy('created_at', 'asc') // Standard chat: Oldest at top, newest at bottom
            ->get();

        return response()->json([
            'success' => true,
            'conversation' => $conversation
        ]);
    }

    /**
     * Send a message to an owner.
     */
    public function send(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'message' => 'required|string|max:2000',
        ]);

        $message = Message::create([
            'sender_id' => auth()->id(),
            'receiver_id' => $request->receiver_id,
            'message' => $request->message,
        ]);

        return response()->json([
            'success' => true,
            'message' => $message
        ], 201);
    }
}

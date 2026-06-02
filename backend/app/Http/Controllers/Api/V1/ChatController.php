<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Ride;
use App\Services\ChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function __construct(
        protected ChatService $chatService,
    ) {}

    public function messages(Request $request, Ride $ride): JsonResponse
    {
        if ($ride->rider_id !== $request->user()->id && $ride->driver_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $messages = $this->chatService->getMessages(
            $ride,
            (int) $request->per_page ?? 50,
            $request->before,
        );

        return response()->json(['data' => $messages]);
    }

    public function send(Request $request, Ride $ride): JsonResponse
    {
        if ($ride->rider_id !== $request->user()->id && $ride->driver_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if (!in_array($ride->status, ['accepted', 'arrived', 'in_progress'])) {
            return response()->json(['message' => 'Chat is only available during active rides.'], 422);
        }

        $validated = $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        try {
            $message = $this->chatService->sendMessage($ride, $request->user(), $validated['message']);
            return response()->json(['message' => $message], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function unread(Request $request, Ride $ride): JsonResponse
    {
        $count = $this->chatService->getUnreadCount($ride, $request->user());
        return response()->json(['unread_count' => $count]);
    }

    public function markRead(Request $request, Ride $ride): JsonResponse
    {
        $this->chatService->markAsRead($ride, $request->user());
        return response()->json(['message' => 'Messages marked as read.']);
    }
}

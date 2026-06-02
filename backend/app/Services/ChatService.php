<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Ride;
use App\Models\RideChatMessage;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class ChatService
{
    public function sendMessage(Ride $ride, User $sender, string $message): RideChatMessage
    {
        if (!$this->canSendMessage($ride, $sender)) {
            throw new \RuntimeException('You are not part of this ride.');
        }

        $chatMessage = RideChatMessage::create([
            'ride_id' => $ride->id,
            'sender_id' => $sender->id,
            'message' => $message,
        ]);

        $this->broadcastMessage($ride, $chatMessage);

        return $chatMessage;
    }

    public function getMessages(Ride $ride, int $limit = 50, ?string $before = null): array
    {
        $query = RideChatMessage::where('ride_id', $ride->id)
            ->with('sender:id,name')
            ->orderBy('created_at', 'desc')
            ->limit($limit);

        if ($before) {
            $query->where('created_at', '<', $before);
        }

        return $query->get()->toArray();
    }

    public function markAsRead(Ride $ride, User $user): int
    {
        return RideChatMessage::where('ride_id', $ride->id)
            ->where('sender_id', '!=', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);
    }

    public function getUnreadCount(Ride $ride, User $user): int
    {
        return RideChatMessage::where('ride_id', $ride->id)
            ->where('sender_id', '!=', $user->id)
            ->where('is_read', false)
            ->count();
    }

    public function sendSystemMessage(Ride $ride, string $message): RideChatMessage
    {
        return RideChatMessage::create([
            'ride_id' => $ride->id,
            'sender_id' => $ride->rider_id,
            'message' => $message,
            'is_system' => true,
        ]);
    }

    private function canSendMessage(Ride $ride, User $sender): bool
    {
        return $sender->id === $ride->rider_id || $sender->id === $ride->driver_id;
    }

    private function broadcastMessage(Ride $ride, RideChatMessage $message): void
    {
        $socketService = app(SocketService::class);

        $payload = [
            'message_id' => $message->id,
            'ride_id' => $ride->id,
            'sender_id' => $message->sender_id,
            'sender_name' => $message->sender->name ?? 'Unknown',
            'message' => $message->message,
            'is_system' => $message->is_system,
            'created_at' => $message->created_at->toIso8601String(),
        ];

        $socketService->broadcast("ride.{$ride->id}", 'chat:message', $payload);
    }
}

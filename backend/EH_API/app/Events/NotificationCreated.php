<?php

namespace App\Events;

use App\Models\Notification;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Queue\SerializesModels;

class NotificationCreated implements ShouldBroadcastNow
{
    use InteractsWithSockets, SerializesModels;

    public function __construct(
        public Notification $notification
    ) {}

    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel('user.'.$this->notification->user_id);
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->notification->id,
            'user_id' => $this->notification->user_id,
            'title' => $this->notification->title,
            'message' => $this->notification->message,
            'is_read' => $this->notification->is_read,
            'created_at' => $this->notification->created_at?->toDateTimeString(),
            'updated_at' => $this->notification->updated_at?->toDateTimeString(),
        ];
    }

    public function broadcastAs(): string
    {
        return 'notification.created';
    }
}

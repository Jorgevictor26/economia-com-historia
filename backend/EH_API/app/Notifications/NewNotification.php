<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Contracts\Queue\ShouldQueue;

class NewNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public int $recipientId,
        public string $title,
        public string $message,
        public array $meta = []
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['database', 'broadcast'];
    }

    /**
     * Get the array representation for database channel.
     */
    public function toArray($notifiable): array
    {
        return [
            'user_id' => $this->recipientId,
            'title' => $this->title,
            'message' => $this->message,
            'meta' => $this->meta,
        ];
    }

    /**
     * Get the broadcastable representation of the notification.
     */
    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'data' => $this->toArray($notifiable),
        ]);
    }
}

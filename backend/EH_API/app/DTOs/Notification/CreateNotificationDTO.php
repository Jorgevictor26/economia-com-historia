<?php

namespace App\DTOs\Notification;

class CreateNotificationDTO
{
    public function __construct(
        public int $userId,
        public string $title,
        public string $message
    ) {}
}
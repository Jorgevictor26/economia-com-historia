<?php

namespace App\DTOs\Notification;

readonly class CreateNotificationDTO
{
    public function __construct(public array $data = [])
    {
    }
}

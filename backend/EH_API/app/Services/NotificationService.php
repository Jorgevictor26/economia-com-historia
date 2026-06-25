<?php

namespace App\Services;

use App\DTOs\Notification\CreateNotificationDTO;

use App\Repositories\NotificationRepository;

class NotificationService
{
    public function __construct(
        private NotificationRepository $repository
    ) {}

    public function create(
        CreateNotificationDTO $dto
    )
    {
        return $this->repository->create([
            'user_id' => $dto->userId,
            'title' => $dto->title,
            'message' => $dto->message
        ]);
    }

    public function getByUser(
        int $userId,
        array $filters = []
    )
    {
        return $this->repository
            ->getByUser($userId, $filters);
    }

    public function markAsRead(
        int $id
    )
    {
        return $this->repository
            ->markAsRead($id);
    }
}

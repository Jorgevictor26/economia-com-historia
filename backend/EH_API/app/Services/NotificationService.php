<?php

namespace App\Services;

use App\DTOs\Notification\CreateNotificationDTO;

use App\Repositories\NotificationRepository;
use App\Events\NotificationCreated;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    public function __construct(
        private NotificationRepository $repository
    ) {}

    public function create(
        CreateNotificationDTO $dto
    )
    {
        $notification = $this->repository->create([
            'user_id' => $dto->userId,
            'title' => $dto->title,
            'message' => $dto->message,
        ]);

        try {
            event(new NotificationCreated($notification));
        } catch (\Throwable $exception) {
            Log::error('Notification broadcast failed', [
                'notification_id' => $notification->id,
                'user_id' => $notification->user_id,
                'exception' => $exception->getMessage(),
            ]);
        }

        return $notification;
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

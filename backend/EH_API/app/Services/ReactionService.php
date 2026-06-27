<?php

namespace App\Services;

use App\DTOs\Reaction\CreateReactionDTO;
use App\Repositories\ReactionRepository;
use App\Services\NotificationService;

class ReactionService
{
    public function __construct(
        private ReactionRepository $repository
        , private NotificationService $notifications
    ) {}

    public function create(CreateReactionDTO $dto)
    {
        return $this->repository->create([
            'user_id' => $dto->userId,
            'content_id' => $dto->contentId,
            'reaction_type' => $dto->reactionType
        ]);
    }

    public function toggle(CreateReactionDTO $dto): array
    {
        $result = $this->repository->toggle([
            'user_id' => $dto->userId,
            'content_id' => $dto->contentId,
            'reaction_type' => $dto->reactionType,
        ]);

        if ($result['reacted'] && $result['reaction']) {
            $reaction = $result['reaction'];
            $reaction->load('content.user', 'user');

            if ($reaction->content && $reaction->content->user_id !== $dto->userId) {
                $this->notifications->create(
                    new \App\DTOs\Notification\CreateNotificationDTO(
                        $reaction->content->user_id,
                        'Nova reação',
                        sprintf('O utilizador %s reagiu com %s ao seu conteúdo.', $reaction->user->name ?? 'alguém', $reaction->reaction_type)
                    )
                );
            }
        }

        return $result;
    }

    public function getByContent(int $contentId)
    {
        return $this->repository->getByContent($contentId);
    }

    public function getCountByType(int $contentId)
    {
        return $this->repository->getCountByType($contentId);
    }
}

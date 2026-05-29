<?php

namespace App\Services;

use App\DTOs\Reaction\CreateReactionDTO;
use App\Repositories\ReactionRepository;

class ReactionService
{
    public function __construct(
        private ReactionRepository $repository
    ) {}

    public function create(CreateReactionDTO $dto)
    {
        return $this->repository->create([
            'user_id' => $dto->userId,
            'content_id' => $dto->contentId,
            'reaction_type' => $dto->reactionType
        ]);
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

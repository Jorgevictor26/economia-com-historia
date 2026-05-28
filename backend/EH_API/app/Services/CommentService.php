<?php

namespace App\Services;

use App\DTOs\Comment\CreateCommentDTO;
use App\Repositories\CommentRepository;

class CommentService
{
    public function __construct(
        private CommentRepository $repository
    ) {}

    public function create(CreateCommentDTO $dto)
    {
        return $this->repository->create([
            'user_id' => $dto->userId,
            'content_id' => $dto->contentId,
            'comment' => $dto->comment
        ]);
    }

    public function getByContent(int $contentId)
    {
        return $this->repository->getByContent($contentId);
    }
}
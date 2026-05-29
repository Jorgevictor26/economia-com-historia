<?php

namespace App\DTOs\Comment;

class CreateCommentDTO
{
    public function __construct(
        public int $userId,
        public int $contentId,
        public string $comment
    ) {}
}
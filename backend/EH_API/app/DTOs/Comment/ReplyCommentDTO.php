<?php

namespace App\DTOs\Comment;

class CreateReplyCommentDTO
{
    public function __construct(
        public int $userId,
        public int $commentId,
        public string $reply
    ) {}
}
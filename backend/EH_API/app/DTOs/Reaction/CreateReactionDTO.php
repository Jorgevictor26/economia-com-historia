<?php

namespace App\DTOs\Reaction;

class CreateReactionDTO
{
    public function __construct(
        public int $userId,
        public int $contentId,
        public string $reactionType
    ) {}
}

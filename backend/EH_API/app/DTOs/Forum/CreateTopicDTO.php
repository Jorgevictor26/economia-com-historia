<?php

namespace App\DTOs\Forum;

readonly class CreateTopicDTO
{
    public function __construct(
        public int $forumId,
        public int $userId,
        public string $title,
        public string $content
    ) {}
}

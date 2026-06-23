<?php

namespace App\DTOs\Forum;

readonly class ReplyTopicDTO
{
    public function __construct(
        public int $topicId,
        public int $userId,
        public string $reply
    ) {}
}

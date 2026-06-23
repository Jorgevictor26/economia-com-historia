<?php

namespace App\DTOs\Forum;

readonly class UpdateReplyDTO
{
    public function __construct(
        public string $reply
    ) {}

    public function toArray(): array
    {
        return [
            'reply' => $this->reply,
        ];
    }
}

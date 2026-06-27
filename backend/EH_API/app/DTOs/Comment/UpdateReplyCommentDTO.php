<?php

namespace App\DTOs\Comment;

readonly class UpdateReplyCommentDTO
{
    public function __construct(
        public string $reply,
    ) {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            reply: $data['reply'],
        );
    }

    public function toArray(): array
    {
        return [
            'reply' => $this->reply,
        ];
    }
}

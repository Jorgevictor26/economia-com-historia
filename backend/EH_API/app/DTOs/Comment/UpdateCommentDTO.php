<?php

namespace App\DTOs\Comment;

readonly class UpdateCommentDTO
{
    public function __construct(
        public string $comment,
    ) {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            comment: $data['comment'],
        );
    }

    public function toArray(): array
    {
        return [
            'comment' => $this->comment,
        ];
    }
}

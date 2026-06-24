<?php

namespace App\DTOs\Quiz;

readonly class UpdateQuizDTO
{
    public function __construct(
        public ?int $contentId = null,
        public ?string $title = null,
        public ?string $description = null,
        public ?int $timeLimit = null,
    ) {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            contentId: isset($data['content_id']) ? (int) $data['content_id'] : null,
            title: $data['title'] ?? null,
            description: $data['description'] ?? null,
            timeLimit: array_key_exists('time_limit', $data) && $data['time_limit'] !== null
                ? (int) $data['time_limit']
                : null,
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'content_id' => $this->contentId,
            'title' => $this->title,
            'description' => $this->description,
            'time_limit' => $this->timeLimit,
        ], fn (mixed $value): bool => $value !== null);
    }
}

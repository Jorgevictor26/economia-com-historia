<?php

namespace App\DTOs\Quiz;

readonly class UpdateQuizDTO
{
    public function __construct(
        public ?int $contentId = null,
        public ?string $title = null,
        public ?string $description = null,
        public ?string $coverUrl = null,
        public ?string $difficulty = null,
        public ?int $xpPerQuestion = null,
        public ?int $timeLimit = null,
    ) {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            contentId: isset($data['content_id']) ? (int) $data['content_id'] : null,
            title: $data['title'] ?? null,
            description: $data['description'] ?? null,
            coverUrl: $data['cover_url'] ?? null,
            difficulty: $data['difficulty'] ?? null,
            xpPerQuestion: array_key_exists('xp_per_question', $data) ? 10 : null,
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
            'cover_url' => $this->coverUrl,
            'difficulty' => $this->difficulty,
            'xp_per_question' => $this->xpPerQuestion,
            'time_limit' => $this->timeLimit,
        ], fn (mixed $value): bool => $value !== null);
    }
}

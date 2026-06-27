<?php

namespace App\DTOs\Quiz;

readonly class CreateQuizDTO
{
    public function __construct(
        public int $userId,
        public int $contentId,
        public string $title,
        public ?string $description = null,
        public ?string $coverUrl = null,
        public string $difficulty = 'medio',
        public int $xpPerQuestion = 15,
        public ?int $timeLimit = null,
    ) {
    }

    public static function fromArray(array $data, int $userId): self
    {
        return new self(
            userId: $userId,
            contentId: (int) $data['content_id'],
            title: $data['title'],
            description: $data['description'] ?? null,
            coverUrl: $data['cover_url'] ?? null,
            difficulty: $data['difficulty'],
            xpPerQuestion: (int) $data['xp_per_question'],
            timeLimit: isset($data['time_limit']) ? (int) $data['time_limit'] : null,
        );
    }

    public function toArray(): array
    {
        return [
            'user_id' => $this->userId,
            'content_id' => $this->contentId,
            'title' => $this->title,
            'description' => $this->description,
            'cover_url' => $this->coverUrl,
            'difficulty' => $this->difficulty,
            'xp_per_question' => $this->xpPerQuestion,
            'time_limit' => $this->timeLimit,
        ];
    }
}

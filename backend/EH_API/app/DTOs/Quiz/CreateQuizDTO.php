<?php

namespace App\DTOs\Quiz;

readonly class CreateQuizDTO
{
    public function __construct(
        public int $userId,
        public string $title,
        public ?string $description = null,
        public ?int $timeLimit = null,
    ) {
    }

    public static function fromArray(array $data, int $userId): self
    {
        return new self(
            userId: $userId,
            title: $data['title'],
            description: $data['description'] ?? null,
            timeLimit: isset($data['time_limit']) ? (int) $data['time_limit'] : null,
        );
    }

    public function toArray(): array
    {
        return [
            'user_id' => $this->userId,
            'title' => $this->title,
            'description' => $this->description,
            'time_limit' => $this->timeLimit,
        ];
    }
}

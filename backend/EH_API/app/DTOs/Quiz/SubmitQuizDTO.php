<?php

namespace App\DTOs\Quiz;

readonly class SubmitQuizDTO
{
    public function __construct(
        public int $quizId,
        public int $userId,
        public string $startedAt,
        public array $answers,
        public int $elapsedSeconds = 0,
    ) {
    }

    public static function fromArray(array $data, int $quizId, int $userId): self
    {
        return new self(
            quizId: $quizId,
            userId: $userId,
            startedAt: $data['started_at'],
            answers: $data['answers'],
            elapsedSeconds: (int) ($data['elapsed_seconds'] ?? 0),
        );
    }
}

<?php

namespace App\DTOs\Quiz;

readonly class SubmitQuizDTO
{
    public function __construct(
        public int $quizId,
        public int $userId,
        public string $startedAt,
        public array $answers,
    ) {
    }

    public static function fromArray(array $data, int $quizId, int $userId): self
    {
        return new self(
            quizId: $quizId,
            userId: $userId,
            startedAt: $data['started_at'],
            answers: $data['answers'],
        );
    }
}

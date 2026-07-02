<?php

namespace App\DTOs\QuizProgress;

readonly class UpdateQuizProgressDTO
{
    public function __construct(
        public int $userId,
        public int $quizId,
        public int $progressPercent,
        public ?int $currentQuestionIndex = null,
        public ?array $answeredQuestions = null,
        public int $correctCount = 0,
        public int $elapsedSeconds = 0,
        public ?array $questionOrder = null,
        public ?string $startedAt = null,
    ) {
    }
}

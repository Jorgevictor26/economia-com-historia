<?php

namespace App\DTOs\Quiz;

readonly class QuizResultDTO
{
    public function __construct(
        public int $quizId,
        public int $userId,
        public int $score,
        public int $totalQuestions,
        public float $percentage,
    ) {
    }

    public function toArray(): array
    {
        return [
            'quiz_id' => $this->quizId,
            'user_id' => $this->userId,
            'score' => $this->score,
            'total_questions' => $this->totalQuestions,
            'percentage' => $this->percentage,
            'completed_at' => now(),
        ];
    }
}

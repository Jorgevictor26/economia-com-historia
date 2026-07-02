<?php

namespace App\DTOs\Quiz;

readonly class QuizResultDTO
{
    public function __construct(
        public int $quizId,
        public int $userId,
        public int $score,
        public int $totalQuestions,
        public int $correctAnswers,
        public int $wrongAnswers,
        public float $percentage,
        public int $earnedXp,
        public int $durationSeconds,
        public bool $isBest,
    ) {
    }

    public function toArray(): array
    {
        return [
            'quiz_id' => $this->quizId,
            'user_id' => $this->userId,
            'score' => $this->score,
            'total_questions' => $this->totalQuestions,
            'correct_answers' => $this->correctAnswers,
            'wrong_answers' => $this->wrongAnswers,
            'percentage' => $this->percentage,
            'earned_xp' => $this->earnedXp,
            'duration_seconds' => $this->durationSeconds,
            'is_best' => $this->isBest,
            'completed_at' => now(),
        ];
    }
}

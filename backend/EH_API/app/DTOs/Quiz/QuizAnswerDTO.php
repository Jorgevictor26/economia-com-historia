<?php

namespace App\DTOs\Quiz;

readonly class QuizAnswerDTO
{
    public function __construct(
        public int $questionId,
        public int $alternativeId,
        public int $userId,
        public string $selectedOption,
        public bool $isCorrect,
        public int $elapsedSeconds = 0,
    ) {
    }

    public function toArray(): array
    {
        return [
            'question_id' => $this->questionId,
            'quiz_alternative_id' => $this->alternativeId,
            'user_id' => $this->userId,
            'selected_option' => $this->selectedOption,
            'is_correct' => $this->isCorrect,
            'elapsed_seconds' => $this->elapsedSeconds,
        ];
    }
}

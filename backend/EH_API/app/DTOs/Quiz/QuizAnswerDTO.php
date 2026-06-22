<?php

namespace App\DTOs\Quiz;

readonly class QuizAnswerDTO
{
    public function __construct(
        public int $questionId,
        public int $userId,
        public string $selectedOption,
        public bool $isCorrect,
    ) {
    }

    public function toArray(): array
    {
        return [
            'question_id' => $this->questionId,
            'user_id' => $this->userId,
            'selected_option' => $this->selectedOption,
            'is_correct' => $this->isCorrect,
        ];
    }
}

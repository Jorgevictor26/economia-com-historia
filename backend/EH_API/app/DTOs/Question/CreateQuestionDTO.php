<?php

namespace App\DTOs\Question;

readonly class CreateQuestionDTO
{
    public function __construct(
        public int $quizId,
        public string $question,
        public string $optionA,
        public string $optionB,
        public string $optionC,
        public string $optionD,
        public string $correctOption,
        public ?string $explanation = null,
    ) {
    }

    public static function fromArray(array $data, int $quizId): self
    {
        return new self(
            quizId: $quizId,
            question: $data['question'],
            optionA: $data['option_a'],
            optionB: $data['option_b'],
            optionC: $data['option_c'],
            optionD: $data['option_d'],
            correctOption: $data['correct_option'],
            explanation: $data['explanation'] ?? null,
        );
    }

    public function toArray(): array
    {
        return [
            'quiz_id' => $this->quizId,
            'question' => $this->question,
            'option_a' => $this->optionA,
            'option_b' => $this->optionB,
            'option_c' => $this->optionC,
            'option_d' => $this->optionD,
            'correct_option' => $this->correctOption,
            'explanation' => $this->explanation,
        ];
    }
}

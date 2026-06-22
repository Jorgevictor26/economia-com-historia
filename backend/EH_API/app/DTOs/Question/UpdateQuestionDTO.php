<?php

namespace App\DTOs\Question;

readonly class UpdateQuestionDTO
{
    public function __construct(
        public ?string $question = null,
        public ?string $optionA = null,
        public ?string $optionB = null,
        public ?string $optionC = null,
        public ?string $optionD = null,
        public ?string $correctOption = null,
        public ?string $explanation = null,
    ) {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            question: $data['question'] ?? null,
            optionA: $data['option_a'] ?? null,
            optionB: $data['option_b'] ?? null,
            optionC: $data['option_c'] ?? null,
            optionD: $data['option_d'] ?? null,
            correctOption: $data['correct_option'] ?? null,
            explanation: $data['explanation'] ?? null,
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'question' => $this->question,
            'option_a' => $this->optionA,
            'option_b' => $this->optionB,
            'option_c' => $this->optionC,
            'option_d' => $this->optionD,
            'correct_option' => $this->correctOption,
            'explanation' => $this->explanation,
        ], fn (mixed $value): bool => $value !== null);
    }
}

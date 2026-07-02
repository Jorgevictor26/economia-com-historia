<?php

namespace App\DTOs\Question;

readonly class CreateQuestionDTO
{
    public function __construct(
        public int $quizId,
        public string $question,
        public int $order,
        public array $alternatives,
        public ?string $explanation = null,
    ) {
    }

    public static function fromArray(array $data, int $quizId): self
    {
        return new self(
            quizId: $quizId,
            question: $data['question'],
            order: (int) ($data['order'] ?? 1),
            alternatives: array_values($data['alternatives']),
            explanation: $data['explanation'] ?? null,
        );
    }

    public function toArray(): array
    {
        return [
            'quiz_id' => $this->quizId,
            'question' => $this->question,
            'order' => $this->order,
            'option_a' => $this->alternatives[0]['text'] ?? '',
            'option_b' => $this->alternatives[1]['text'] ?? '',
            'option_c' => $this->alternatives[2]['text'] ?? '',
            'option_d' => $this->alternatives[3]['text'] ?? '',
            'correct_option' => $this->legacyCorrectOption(),
            'explanation' => $this->explanation,
        ];
    }

    private function legacyCorrectOption(): string
    {
        $index = collect($this->alternatives)
            ->search(fn (array $alternative): bool => (bool) ($alternative['is_correct'] ?? false));

        return ['a', 'b', 'c', 'd'][(int) $index] ?? 'a';
    }
}

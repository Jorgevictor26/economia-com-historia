<?php

namespace App\DTOs\Question;

readonly class UpdateQuestionDTO
{
    public function __construct(
        public ?string $question = null,
        public ?int $order = null,
        public ?array $alternatives = null,
        public ?string $explanation = null,
    ) {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            question: $data['question'] ?? null,
            order: isset($data['order']) ? (int) $data['order'] : null,
            alternatives: isset($data['alternatives']) ? array_values($data['alternatives']) : null,
            explanation: $data['explanation'] ?? null,
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'question' => $this->question,
            'order' => $this->order,
            'option_a' => $this->alternatives[0]['text'] ?? null,
            'option_b' => $this->alternatives[1]['text'] ?? null,
            'option_c' => $this->alternatives[2]['text'] ?? null,
            'option_d' => $this->alternatives[3]['text'] ?? null,
            'correct_option' => $this->legacyCorrectOption(),
            'explanation' => $this->explanation,
        ], fn (mixed $value): bool => $value !== null);
    }

    private function legacyCorrectOption(): ?string
    {
        if ($this->alternatives === null) {
            return null;
        }

        $index = collect($this->alternatives)
            ->search(fn (array $alternative): bool => (bool) ($alternative['is_correct'] ?? false));

        return ['a', 'b', 'c', 'd'][(int) $index] ?? 'a';
    }
}

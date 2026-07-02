<?php

namespace App\DTOs\Quiz;

readonly class UpdateQuizDTO
{
    public function __construct(
        public ?int $contentId = null,
        public ?int $categoryId = null,
        public ?string $title = null,
        public ?string $description = null,
        public ?string $coverUrl = null,
        public ?string $difficulty = null,
        public ?int $xpPerQuestion = null,
        public ?string $status = null,
        public ?int $timeLimit = null,
    ) {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            contentId: isset($data['content_id']) ? (int) $data['content_id'] : null,
            categoryId: isset($data['category_id']) ? (int) $data['category_id'] : null,
            title: $data['title'] ?? null,
            description: $data['description'] ?? null,
            coverUrl: $data['cover_url'] ?? null,
            difficulty: isset($data['difficulty']) ? self::normalizeDifficulty($data['difficulty']) : null,
            xpPerQuestion: isset($data['difficulty']) ? self::rulesForDifficulty(self::normalizeDifficulty($data['difficulty']))['xp'] : null,
            status: isset($data['status']) ? self::normalizeStatus($data['status']) : null,
            timeLimit: null,
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'content_id' => $this->contentId,
            'category_id' => $this->categoryId,
            'title' => $this->title,
            'description' => $this->description,
            'cover_url' => $this->coverUrl,
            'difficulty' => $this->difficulty,
            'xp_per_question' => $this->xpPerQuestion,
            'status' => $this->status,
            'time_limit' => $this->timeLimit,
        ], fn (mixed $value): bool => $value !== null);
    }

    private static function normalizeStatus(string $status): string
    {
        return in_array(strtolower($status), ['inactive', 'inativo'], true) ? 'inactive' : 'active';
    }

    private static function normalizeDifficulty(string $difficulty): string
    {
        $value = strtolower(str_replace(['á', 'é', 'í', 'ó', 'ú'], ['a', 'e', 'i', 'o', 'u'], trim($difficulty)));

        return match ($value) {
            'media', 'medio' => 'medio',
            'dificil' => 'dificil',
            default => 'facil',
        };
    }

    private static function rulesForDifficulty(string $difficulty): array
    {
        return match ($difficulty) {
            'medio' => ['time_seconds' => 20, 'score' => 20, 'xp' => 20],
            'dificil' => ['time_seconds' => 15, 'score' => 30, 'xp' => 30],
            default => ['time_seconds' => 30, 'score' => 10, 'xp' => 10],
        };
    }
}

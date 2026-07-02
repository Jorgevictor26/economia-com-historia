<?php

namespace App\DTOs\Quiz;

readonly class CreateQuizDTO
{
    public function __construct(
        public int $userId,
        public int $contentId,
        public int $categoryId,
        public string $title,
        public ?string $description = null,
        public ?string $coverUrl = null,
        public string $difficulty = 'medio',
        public int $xpPerQuestion = 20,
        public string $status = 'active',
        public ?int $timeLimit = null,
    ) {
    }

    public static function fromArray(array $data, int $userId): self
    {
        return new self(
            userId: $userId,
            contentId: (int) $data['content_id'],
            categoryId: (int) $data['category_id'],
            title: $data['title'],
            description: $data['description'] ?? null,
            coverUrl: $data['cover_url'] ?? null,
            difficulty: self::normalizeDifficulty($data['difficulty']),
            xpPerQuestion: self::rulesForDifficulty(self::normalizeDifficulty($data['difficulty']))['xp'],
            status: self::normalizeStatus($data['status'] ?? 'active'),
            timeLimit: null,
        );
    }

    public function toArray(): array
    {
        return [
            'user_id' => $this->userId,
            'content_id' => $this->contentId,
            'category_id' => $this->categoryId,
            'title' => $this->title,
            'description' => $this->description,
            'cover_url' => $this->coverUrl,
            'difficulty' => $this->difficulty,
            'xp_per_question' => $this->xpPerQuestion,
            'status' => $this->status,
            'time_limit' => $this->timeLimit,
        ];
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

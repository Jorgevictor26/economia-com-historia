<?php

namespace App\DTOs\Report;

readonly class CreateReportDTO
{
    public function __construct(
        public int $userId,
        public int $commentId,
        public string $reason,
        public ?string $description = null,
    ) {
    }

    public static function fromArray(array $data, int $userId): self
    {
        return new self(
            userId: $userId,
            commentId: (int) $data['comment_id'],
            reason: $data['reason'],
            description: $data['description'] ?? null,
        );
    }

    public function toArray(): array
    {
        return [
            'user_id' => $this->userId,
            'comment_id' => $this->commentId,
            'reason' => $this->reason,
            'description' => $this->description,
            'status' => 'pending',
        ];
    }
}

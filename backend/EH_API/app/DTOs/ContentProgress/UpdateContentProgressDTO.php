<?php

namespace App\DTOs\ContentProgress;

readonly class UpdateContentProgressDTO
{
    public function __construct(
        public int $userId,
        public int $contentId,
        public int $progressPercent,
        public ?int $lastPositionSeconds = null,
    ) {
    }
}

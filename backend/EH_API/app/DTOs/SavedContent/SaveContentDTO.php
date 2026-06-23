<?php

namespace App\DTOs\SavedContent;

readonly class SaveContentDTO
{
    public function __construct(
        public int $userId,
        public int $contentId
    ) {}
}

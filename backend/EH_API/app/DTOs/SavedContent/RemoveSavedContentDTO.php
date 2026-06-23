<?php

namespace App\DTOs\SavedContent;

readonly class RemoveSavedContentDTO
{
    public function __construct(
        public int $userId,
        public int $contentId
    ) {}
}

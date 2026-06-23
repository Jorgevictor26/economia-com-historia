<?php

namespace App\DTOs\Content;

readonly class DeleteContentMediaDTO
{
    public function __construct(
        public int $contentId,
        public int $userId,
        public string $mediaType,
        public bool $canRemove
    ) {}
}

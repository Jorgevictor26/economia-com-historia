<?php

namespace App\DTOs\Forum;

readonly class CreateForumDTO
{
    public function __construct(
        public int $userId,
        public string $name,
        public ?string $description = null,
        public ?string $rules = null,
        public ?string $category = null,
        public ?string $imageUrl = null,
        public string $visibility = 'public',
        public ?string $accessCode = null,
        public bool $joinApprovalRequired = false,
        public string $contentPermission = 'public',
        public bool $allowAttachments = false,
        public array $contentIds = [],
    ) {}
}

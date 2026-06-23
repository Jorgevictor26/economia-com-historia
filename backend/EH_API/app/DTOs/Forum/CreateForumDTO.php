<?php

namespace App\DTOs\Forum;

readonly class CreateForumDTO
{
    public function __construct(
        public string $name,
        public ?string $description = null
    ) {}
}

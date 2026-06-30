<?php

namespace App\DTOs\Content;

class CreateContentDTO
{
    public function __construct(
        public int $user_id,
        public ?int $category_id,
        public ?int $content_type_id,
        public string $title,
        public ?string $summary,
        public string $content,
        public ?string $imageUrl,
        public ?string $videoUrl,
        public string $visibility
    ) {}
}

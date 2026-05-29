<?php

namespace App\DTOs\Content;

class CreateContentDTO
{
    public function __construct(
        public int $user_id,
        public ?int $category_id,
        public string $title,
        public ?string $summary,
        public string $content,
        public ?string $image,
        public ?string $video,
        public string $visibility
    ) {}
}
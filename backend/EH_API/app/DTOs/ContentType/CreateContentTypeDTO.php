<?php

namespace App\DTOs\ContentType;

class CreateContentTypeDTO
{
    public function __construct(
        public string $name,
        public string $slug,
        public ?string $description = null
    ) {}
}

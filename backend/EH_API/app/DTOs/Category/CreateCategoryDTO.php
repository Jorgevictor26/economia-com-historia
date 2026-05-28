<?php

namespace App\DTOs\Category;

class CreateCategoryDTO
{
    public function __construct(
        public string $name,
        public ?string $description
    ) {}
}
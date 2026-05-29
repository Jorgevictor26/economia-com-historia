<?php

namespace App\DTOs\Category;

readonly class UpdateCategoryDTO
{
    public function __construct(public array $data = [])
    {
    }
}

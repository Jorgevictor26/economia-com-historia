<?php

namespace App\DTOs\Forum;

readonly class CreateForumDTO
{
    public function __construct(public array $data = [])
    {
    }
}

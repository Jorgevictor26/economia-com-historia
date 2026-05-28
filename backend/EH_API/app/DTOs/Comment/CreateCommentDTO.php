<?php

namespace App\DTOs\Comment;

readonly class CreateCommentDTO
{
    public function __construct(public array $data = [])
    {
    }
}

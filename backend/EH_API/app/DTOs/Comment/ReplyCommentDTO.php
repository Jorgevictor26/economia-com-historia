<?php

namespace App\DTOs\Comment;

readonly class ReplyCommentDTO
{
    public function __construct(public array $data = [])
    {
    }
}

<?php

namespace App\DTOs\Quiz;

readonly class UpdateQuizDTO
{
    public function __construct(public array $data = [])
    {
    }
}

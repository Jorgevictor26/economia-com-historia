<?php

namespace App\DTOs\Quiz;

readonly class CreateQuizDTO
{
    public function __construct(public array $data = [])
    {
    }
}

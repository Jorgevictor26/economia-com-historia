<?php

namespace App\DTOs\Quiz;

readonly class SubmitQuizDTO
{
    public function __construct(public array $data = [])
    {
    }
}

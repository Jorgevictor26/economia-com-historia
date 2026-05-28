<?php

namespace App\DTOs\Quiz;

readonly class QuizResultDTO
{
    public function __construct(public array $data = [])
    {
    }
}

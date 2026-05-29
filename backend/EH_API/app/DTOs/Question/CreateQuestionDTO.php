<?php

namespace App\DTOs\Question;

readonly class CreateQuestionDTO
{
    public function __construct(public array $data = [])
    {
    }
}

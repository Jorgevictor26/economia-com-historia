<?php

namespace App\DTOs\Question;

readonly class UpdateQuestionDTO
{
    public function __construct(public array $data = [])
    {
    }
}

<?php

namespace App\DTOs\Forum;

readonly class CreateTopicDTO
{
    public function __construct(public array $data = [])
    {
    }
}

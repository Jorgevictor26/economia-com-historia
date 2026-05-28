<?php

namespace App\DTOs\Content;

readonly class UpdateContentDTO
{
    public function __construct(public array $data = [])
    {
    }
}

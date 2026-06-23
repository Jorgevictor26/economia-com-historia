<?php

namespace App\DTOs\Forum;

readonly class UpdateForumDTO
{
    public function __construct(
        public ?string $name = null,
        public ?string $description = null,
        public bool $hasName = false,
        public bool $hasDescription = false
    ) {}

    public function toArray(): array
    {
        $data = [];

        if ($this->hasName) {
            $data['name'] = $this->name;
        }

        if ($this->hasDescription) {
            $data['description'] = $this->description;
        }

        return $data;
    }
}

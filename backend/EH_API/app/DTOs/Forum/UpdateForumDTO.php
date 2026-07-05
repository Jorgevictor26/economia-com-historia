<?php

namespace App\DTOs\Forum;

readonly class UpdateForumDTO
{
    public function __construct(
        public ?string $name = null,
        public ?string $description = null,
        public ?array $artifacts = null,
        public bool $hasName = false,
        public bool $hasDescription = false,
        public bool $hasArtifacts = false
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

        if ($this->hasArtifacts) {
            $data['artifacts'] = $this->artifacts;
            $data['allow_attachments'] = ! empty($this->artifacts);
        }

        return $data;
    }
}

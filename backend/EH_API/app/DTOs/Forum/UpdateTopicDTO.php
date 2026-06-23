<?php

namespace App\DTOs\Forum;

readonly class UpdateTopicDTO
{
    public function __construct(
        public ?string $title = null,
        public ?string $content = null,
        public bool $hasTitle = false,
        public bool $hasContent = false
    ) {}

    public function toArray(): array
    {
        $data = [];

        if ($this->hasTitle) {
            $data['title'] = $this->title;
        }

        if ($this->hasContent) {
            $data['content'] = $this->content;
        }

        return $data;
    }
}

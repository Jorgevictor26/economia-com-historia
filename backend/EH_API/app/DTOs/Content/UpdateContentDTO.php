<?php

namespace App\DTOs\Content;

readonly class UpdateContentDTO
{
    public function __construct(
        public ?int $categoryId = null,
        public ?int $contentTypeId = null,
        public ?string $title = null,
        public ?string $summary = null,
        public ?string $content = null,
        public ?string $image = null,
        public ?string $video = null,
        public ?string $visibility = null,
    ) {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            categoryId: array_key_exists('category_id', $data) ? $data['category_id'] : null,
            contentTypeId: isset($data['content_type_id']) ? (int) $data['content_type_id'] : null,
            title: $data['title'] ?? null,
            summary: $data['summary'] ?? null,
            content: $data['content'] ?? null,
            image: $data['image'] ?? null,
            video: $data['video'] ?? null,
            visibility: $data['visibility'] ?? null,
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'category_id' => $this->categoryId,
            'content_type_id' => $this->contentTypeId,
            'title' => $this->title,
            'summary' => $this->summary,
            'content' => $this->content,
            'image' => $this->image,
            'video' => $this->video,
            'visibility' => $this->visibility,
        ], fn (mixed $value): bool => $value !== null);
    }
}

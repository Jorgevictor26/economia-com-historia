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
        public ?string $imageUrl = null,
        public ?string $videoUrl = null,
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
            imageUrl: $data['image_url'] ?? null,
            videoUrl: $data['video_url'] ?? null,
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
            'image_url' => $this->imageUrl,
            'video_url' => $this->videoUrl,
            'visibility' => $this->visibility,
        ], fn (mixed $value): bool => $value !== null);
    }
}

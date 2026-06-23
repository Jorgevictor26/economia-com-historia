<?php

namespace App\Repositories;

use App\Models\Content;

class ContentRepository
{
    public function create(array $data): Content
    {
        return Content::create($data);
    }

    public function all(array $filters = [])
    {
        return Content::query()
            ->with(['author', 'category', 'contentType'])
            ->when($filters['category_id'] ?? null, fn ($query, $categoryId) => $query->where('category_id', $categoryId))
            ->when($filters['content_type_id'] ?? null, fn ($query, $contentTypeId) => $query->where('content_type_id', $contentTypeId))
            ->when($filters['type'] ?? null, fn ($query, $type) => $query->whereHas('contentType', fn ($typeQuery) => $typeQuery->where('slug', $type)))
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($searchQuery) use ($search) {
                    $searchQuery
                        ->where('title', 'like', "%{$search}%")
                        ->orWhere('summary', 'like', "%{$search}%")
                        ->orWhere('content', 'like', "%{$search}%")
                        ->orWhereHas('author', fn ($authorQuery) => $authorQuery->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('category', fn ($categoryQuery) => $categoryQuery->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('contentType', fn ($typeQuery) => $typeQuery->where('name', 'like', "%{$search}%"));
                });
            })
            ->latest()
            ->paginate(10);
    }

    public function findById(int $id): ?Content
    {
        return Content::with(['author', 'category', 'contentType'])->find($id);
    }

    public function update(Content $content, array $data): Content
    {
        $content->update($data);

        return $content->fresh(['author', 'category', 'contentType']);
    }

    public function delete(Content $content): bool
    {
        return (bool) $content->delete();
    }

    public function updateVisibility(Content $content, string $visibility): Content
    {
        $content->update([
            'visibility' => $visibility,
        ]);

        return $content->fresh(['author', 'category', 'contentType']);
    }

    public function updateMedia(Content $content, string $column, ?string $url): Content
    {
        $content->update([
            $column => $url,
        ]);

        return $content->fresh(['author', 'category', 'contentType']);
    }
}

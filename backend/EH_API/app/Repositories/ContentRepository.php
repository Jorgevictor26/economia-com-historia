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
            ->latest()
            ->paginate(10);
    }

    public function findById(int $id): ?Content
    {
        return Content::with(['author', 'category', 'contentType'])->find($id);
    }
}

<?php

namespace App\Repositories;

use App\Models\Content;
use App\Models\User;

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
            ->withCount(['reactions', 'comments'])
            ->when($filters['user_id'] ?? null, function ($query, $userId) {
                $query->withExists([
                    'reactions as liked_by_me' => fn ($reactionQuery) => $reactionQuery
                        ->where('user_id', $userId)
                        ->where('reaction_type', 'like'),
                ]);
            })
            ->when(! ($filters['include_jindungo'] ?? false), function ($query) {
                $query->whereDoesntHave('contentType', fn ($typeQuery) => $typeQuery->where('slug', 'jindungo'));
            })
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
        return Content::with(['author.roles', 'category', 'contentType'])
            ->withCount(['reactions', 'comments'])
            ->find($id);
    }

    public function update(Content $content, array $data): Content
    {
        $content->update($data);

        return $content->fresh(['author', 'category', 'contentType']);
    }

    public function delete(Content $content, User $deletedBy): bool
    {
        $content->forceFill([
            'deleted_by' => $deletedBy->id,
        ])->save();

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
        $updates = [
            $column => $url,
        ];

        if ($column === 'image_url') {
            $updates['image'] = null;
        }

        if ($column === 'video_url') {
            $updates['video'] = null;
        }

        $content->update($updates);

        return $content->fresh(['author', 'category', 'contentType']);
    }
}

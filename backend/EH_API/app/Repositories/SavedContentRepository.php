<?php

namespace App\Repositories;

use App\Models\SavedContent;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class SavedContentRepository
{
    public function create(array $data): SavedContent
    {
        return SavedContent::create($data)->load(['content.author', 'content.category', 'content.contentType']);
    }

    public function exists(int $userId, int $contentId): bool
    {
        return SavedContent::where('user_id', $userId)
            ->where('content_id', $contentId)
            ->exists();
    }

    public function getByUser(int $userId): LengthAwarePaginator
    {
        return SavedContent::with(['content.author', 'content.category', 'content.contentType'])
            ->where('user_id', $userId)
            ->latest('created_at')
            ->paginate(10);
    }
}

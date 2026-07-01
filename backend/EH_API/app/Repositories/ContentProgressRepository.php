<?php

namespace App\Repositories;

use App\Models\ContentProgress;
use Illuminate\Support\Collection;

class ContentProgressRepository
{
    public function latestByUser(int $userId, int $limit = 3): Collection
    {
        return ContentProgress::with(['content.author', 'content.category', 'content.contentType'])
            ->where('user_id', $userId)
            ->where('progress_percent', '>', 0)
            ->where('progress_percent', '<', 100)
            ->latest('updated_at')
            ->limit($limit)
            ->get();
    }

    public function updateOrCreate(array $keys, array $data): ContentProgress
    {
        return ContentProgress::updateOrCreate($keys, $data)
            ->fresh(['content.author', 'content.category', 'content.contentType']);
    }
}

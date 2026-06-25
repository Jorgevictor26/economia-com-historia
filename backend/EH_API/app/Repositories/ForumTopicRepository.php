<?php

namespace App\Repositories;

use App\Models\ForumTopic;
use Illuminate\Database\Eloquent\Collection;

class ForumTopicRepository
{
    public function create(array $data): ForumTopic
    {
        return ForumTopic::create($data)->load(['forum', 'user']);
    }

    public function getByForum(int $forumId, array $filters = []): Collection
    {
        return ForumTopic::with(['user', 'forum'])
            ->withCount('replies')
            ->where('forum_id', $forumId)
            ->when($filters['search'] ?? null, function ($query, string $search) {
                $query->where(function ($searchQuery) use ($search) {
                    $searchQuery
                        ->where('title', 'like', "%{$search}%")
                        ->orWhere('content', 'like', "%{$search}%")
                        ->orWhereHas('user', fn ($userQuery) => $userQuery->where('name', 'like', "%{$search}%"));
                });
            })
            ->latest()
            ->get();
    }

    public function findById(int $id): ?ForumTopic
    {
        return ForumTopic::with(['forum', 'user', 'replies.user'])->find($id);
    }

    public function update(ForumTopic $topic, array $data): ForumTopic
    {
        $topic->update($data);

        return $topic->refresh()->load(['forum', 'user', 'replies.user']);
    }

    public function delete(ForumTopic $topic): bool
    {
        return (bool) $topic->delete();
    }
}

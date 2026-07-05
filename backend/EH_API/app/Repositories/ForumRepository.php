<?php

namespace App\Repositories;

use App\Models\Forum;
use Illuminate\Database\Eloquent\Collection;

class ForumRepository
{
    public function create(array $data, array $contentIds = []): Forum
    {
        $forum = Forum::create($data);

        if ($contentIds !== []) {
            $forum->contents()->sync($contentIds);
        }

        return $forum->fresh(['user', 'reviewer', 'contents.category', 'contents.contentType', 'memberships']);
    }

    public function all(array $filters = []): Collection
    {
        return Forum::query()
            ->where('status', 'approved')
            ->with(['user', 'reviewer', 'contents.category', 'contents.contentType', 'memberships'])
            ->withCount('topics')
            ->when($filters['search'] ?? null, function ($query, string $search) {
                $query->where(function ($searchQuery) use ($search) {
                    $searchQuery
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->get();
    }

    public function allForModeration(array $filters = []): Collection
    {
        return Forum::query()
            ->with(['user', 'reviewer'])
            ->withCount('topics')
            ->when($filters['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
            ->when($filters['search'] ?? null, function ($query, string $search) {
                $query->where(function ($searchQuery) use ($search) {
                    $searchQuery
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhereHas('user', fn ($userQuery) => $userQuery->where('name', 'like', "%{$search}%"));
                });
            })
            ->latest()
            ->get();
    }

    public function findById(int $id, bool $onlyApproved = true): ?Forum
    {
        return Forum::with(['topics.user', 'user', 'reviewer', 'contents.category', 'contents.contentType', 'memberships'])
            ->when($onlyApproved, fn ($query) => $query->where('status', 'approved'))
            ->find($id);
    }

    public function updateStatus(Forum $forum, string $status, int $reviewerId): Forum
    {
        $forum->update([
            'status' => $status,
            'reviewed_by' => $reviewerId,
            'reviewed_at' => now(),
        ]);

        return $forum->fresh(['topics.user', 'user', 'reviewer']);
    }

    public function update(Forum $forum, array $data): Forum
    {
        $forum->update($data);

        return $forum->refresh();
    }

    public function delete(Forum $forum): bool
    {
        return (bool) $forum->delete();
    }
}

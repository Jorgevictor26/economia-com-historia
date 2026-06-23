<?php

namespace App\Repositories;

use App\Models\Forum;
use Illuminate\Database\Eloquent\Collection;

class ForumRepository
{
    public function create(array $data): Forum
    {
        return Forum::create($data);
    }

    public function all(): Collection
    {
        return Forum::withCount('topics')
            ->latest()
            ->get();
    }

    public function findById(int $id): ?Forum
    {
        return Forum::with(['topics.user'])->find($id);
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

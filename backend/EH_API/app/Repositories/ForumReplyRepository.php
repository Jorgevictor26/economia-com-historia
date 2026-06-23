<?php

namespace App\Repositories;

use App\Models\ForumReply;
use Illuminate\Database\Eloquent\Collection;

class ForumReplyRepository
{
    public function create(array $data): ForumReply
    {
        return ForumReply::create($data)->load(['topic', 'user']);
    }

    public function getByTopic(int $topicId): Collection
    {
        return ForumReply::with(['user', 'topic'])
            ->where('topic_id', $topicId)
            ->oldest()
            ->get();
    }

    public function findById(int $id): ?ForumReply
    {
        return ForumReply::with(['topic', 'user'])->find($id);
    }

    public function update(ForumReply $reply, array $data): ForumReply
    {
        $reply->update($data);

        return $reply->refresh()->load(['topic', 'user']);
    }

    public function delete(ForumReply $reply): bool
    {
        return (bool) $reply->delete();
    }
}

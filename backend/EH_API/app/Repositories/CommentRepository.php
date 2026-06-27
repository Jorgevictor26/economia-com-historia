<?php

namespace App\Repositories;

use App\Models\Comment;
use App\Models\CommentReply;

class CommentRepository
{
    public function create(array $data): Comment
    {
        return Comment::create($data);
    }

    public function getByContent(int $contentId, array $filters = [])
    {
        return Comment::with(['user', 'replies.user'])
            ->where('content_id', $contentId)
            ->whereNull('hidden_at')
            ->when($filters['search'] ?? null, function ($query, string $search) {
                $query->where(function ($searchQuery) use ($search) {
                    $searchQuery
                        ->where('comment', 'like', "%{$search}%")
                        ->orWhereHas('user', fn ($userQuery) => $userQuery->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('replies', fn ($replyQuery) => $replyQuery->where('reply', 'like', "%{$search}%"));
                });
            })
            ->latest()
            ->get();
    }

    public function findById(int $id): ?Comment
    {
        return Comment::find($id);
    }

    public function findReplyById(int $id): ?CommentReply
    {
        return CommentReply::find($id);
    }

    public function hide(Comment $comment): Comment
    {
        if ($comment->hidden_at === null) {
            $comment->update(['hidden_at' => now()]);
        }

        return $comment->fresh();
    }

    public function update(Comment $comment, array $data): Comment
    {
        $comment->update($data);

        return $comment->fresh();
    }

    public function updateReply(CommentReply $reply, array $data): CommentReply
    {
        $reply->update($data);

        return $reply->fresh();
    }

    public function createReply(array $data): CommentReply
    {
        return CommentReply::create($data);
    }

    public function deleteReply(CommentReply $reply): bool
    {
        return (bool) $reply->delete();
    }
}

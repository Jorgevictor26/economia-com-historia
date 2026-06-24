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

    public function createReply(array $data): CommentReply
    {
        return CommentReply::create($data);
    }
}

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

    public function getByContent(int $contentId)
    {
        return Comment::with(['user', 'replies.user'])
            ->where('content_id', $contentId)
            ->latest()
            ->get();
    }

    public function createReply(array $data): CommentReply
    {
        return CommentReply::create($data);
    }
}

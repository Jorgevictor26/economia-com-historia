<?php

namespace App\Repositories;

use App\Models\Comment;

class CommentRepository
{
    public function create(array $data): Comment
    {
        return Comment::create($data);
    }

    public function getByContent(int $contentId)
    {
        return Comment::with('user')
            ->where('content_id', $contentId)
            ->latest()
            ->get();
    }
}
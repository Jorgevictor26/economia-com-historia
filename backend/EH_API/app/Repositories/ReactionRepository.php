<?php

namespace App\Repositories;

use App\Models\Reaction;

class ReactionRepository
{
    public function create(array $data)
    {
        return Reaction::create($data);
    }

    public function getByContent(int $contentId)
    {
        return Reaction::where('content_id', $contentId)->get();
    }

    public function getCountByType(int $contentId)
    {
        return Reaction::where('content_id', $contentId)
            ->groupBy('reaction_type')
            ->selectRaw('reaction_type, count(*) as count')
            ->get();
    }
}

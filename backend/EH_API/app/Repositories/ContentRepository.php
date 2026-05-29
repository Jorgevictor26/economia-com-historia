<?php

namespace App\Repositories;

use App\Models\Content;

class ContentRepository
{
    public function create(array $data): Content
    {
        return Content::create($data);
    }

    public function all()
    {
        return Content::latest()->paginate(10);
    }

    public function findById(int $id): ?Content
    {
        return Content::find($id);
    }
}
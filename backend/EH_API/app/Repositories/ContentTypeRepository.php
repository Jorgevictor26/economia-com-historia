<?php

namespace App\Repositories;

use App\Models\ContentType;

class ContentTypeRepository
{
    public function create(array $data): ContentType
    {
        return ContentType::create($data);
    }

    public function all()
    {
        return ContentType::orderBy('name')->get();
    }

    public function findById(int $id): ?ContentType
    {
        return ContentType::find($id);
    }
}

<?php

namespace App\Repositories;

use App\Models\ContentType;

class ContentTypeRepository
{
    public function create(array $data): ContentType
    {
        return ContentType::create($data);
    }

    public function all(array $filters = [])
    {
        return ContentType::query()
            ->when($filters['search'] ?? null, function ($query, string $search) {
                $query->where(function ($searchQuery) use ($search) {
                    $searchQuery
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->get();
    }

    public function findById(int $id): ?ContentType
    {
        return ContentType::find($id);
    }
}

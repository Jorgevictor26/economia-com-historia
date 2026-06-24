<?php

namespace App\Repositories;

use App\Models\Category;

class CategoryRepository
{
    public function create(array $data): Category
    {
        return Category::create($data);
    }

    public function all(array $filters = [])
    {
        return Category::query()
            ->when($filters['search'] ?? null, function ($query, string $search) {
                $query->where(function ($searchQuery) use ($search) {
                    $searchQuery
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->get();
    }

    public function findById(int $id): ?Category
    {
        return Category::find($id);
    }
}

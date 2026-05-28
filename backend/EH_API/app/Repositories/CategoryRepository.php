<?php

namespace App\Repositories;

use App\Models\Category;

class CategoryRepository
{
    public function create(array $data): Category
    {
        return Category::create($data);
    }

    public function all()
    {
        return Category::latest()->get();
    }

    public function findById(int $id): ?Category
    {
        return Category::find($id);
    }
}
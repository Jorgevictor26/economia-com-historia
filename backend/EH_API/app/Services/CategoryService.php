<?php

namespace App\Services;

use App\DTOs\Category\CreateCategoryDTO;
use App\Repositories\CategoryRepository;

class CategoryService
{
    public function __construct(
        private CategoryRepository $repository
    ) {}

    public function create(CreateCategoryDTO $dto)
    {
        return $this->repository->create([
            'name' => $dto->name,
            'description' => $dto->description
        ]);
    }

    public function getAll(array $filters = [])
    {
        return $this->repository->all($filters);
    }

    public function findById(int $id)
    {
        return $this->repository->findById($id);
    }
}

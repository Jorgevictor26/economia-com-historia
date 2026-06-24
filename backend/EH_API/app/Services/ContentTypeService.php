<?php

namespace App\Services;

use App\DTOs\ContentType\CreateContentTypeDTO;
use App\Repositories\ContentTypeRepository;

class ContentTypeService
{
    public function __construct(
        private ContentTypeRepository $repository
    ) {}

    public function create(CreateContentTypeDTO $dto)
    {
        return $this->repository->create([
            'name' => $dto->name,
            'slug' => $dto->slug,
            'description' => $dto->description,
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

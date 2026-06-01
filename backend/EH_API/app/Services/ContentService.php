<?php

namespace App\Services;

use App\DTOs\Content\CreateContentDTO;
use App\Repositories\ContentRepository;

class ContentService
{
    public function __construct(
        private ContentRepository $repository
    ) {}

    public function create(CreateContentDTO $dto)
    {
        return $this->repository->create([
            'user_id' => $dto->user_id,
            'category_id' => $dto->category_id,
            'content_type_id' => $dto->content_type_id,
            'title' => $dto->title,
            'summary' => $dto->summary,
            'content' => $dto->content,
            'image' => $dto->image,
            'video' => $dto->video,
            'visibility' => $dto->visibility
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

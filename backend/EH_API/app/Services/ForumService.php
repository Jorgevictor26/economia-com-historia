<?php

namespace App\Services;

use App\DTOs\Forum\CreateForumDTO;
use App\DTOs\Forum\UpdateForumDTO;
use App\Models\Forum;
use App\Repositories\ForumRepository;

class ForumService
{
    public function __construct(
        private ForumRepository $repository
    ) {}

    public function create(CreateForumDTO $dto): Forum
    {
        return $this->repository->create([
            'name' => $dto->name,
            'description' => $dto->description,
        ]);
    }

    public function getAll(array $filters = [])
    {
        return $this->repository->all($filters);
    }

    public function findById(int $id): ?Forum
    {
        return $this->repository->findById($id);
    }

    public function update(int $id, UpdateForumDTO $dto): ?Forum
    {
        $forum = $this->repository->findById($id);

        if (! $forum) {
            return null;
        }

        return $this->repository->update($forum, $dto->toArray());
    }

    public function delete(int $id): bool
    {
        $forum = $this->repository->findById($id);

        if (! $forum) {
            return false;
        }

        return $this->repository->delete($forum);
    }
}

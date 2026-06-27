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
            'user_id' => $dto->userId,
            'name' => $dto->name,
            'description' => $dto->description,
            'rules' => $dto->rules,
            'category' => $dto->category,
            'image_url' => $dto->imageUrl,
            'visibility' => $dto->visibility,
            'content_permission' => $dto->contentPermission,
            'allow_attachments' => $dto->allowAttachments,
            'status' => 'pending',
        ], $dto->contentIds);
    }

    public function getAll(array $filters = [])
    {
        return $this->repository->all($filters);
    }

    public function getAllForModeration(array $filters = [])
    {
        return $this->repository->allForModeration($filters);
    }

    public function findById(int $id, bool $onlyApproved = true): ?Forum
    {
        return $this->repository->findById($id, $onlyApproved);
    }

    public function update(int $id, UpdateForumDTO $dto): ?Forum
    {
        $forum = $this->repository->findById($id, false);

        if (! $forum) {
            return null;
        }

        return $this->repository->update($forum, $dto->toArray());
    }

    public function delete(int $id): bool
    {
        $forum = $this->repository->findById($id, false);

        if (! $forum) {
            return false;
        }

        return $this->repository->delete($forum);
    }

    public function approve(int $id, int $reviewerId): ?Forum
    {
        $forum = $this->repository->findById($id, false);

        if (! $forum) {
            return null;
        }

        return $this->repository->updateStatus($forum, 'approved', $reviewerId);
    }

    public function reject(int $id, int $reviewerId): ?Forum
    {
        $forum = $this->repository->findById($id, false);

        if (! $forum) {
            return null;
        }

        return $this->repository->updateStatus($forum, 'rejected', $reviewerId);
    }
}

<?php

namespace App\Services;

use App\DTOs\Forum\CreateTopicDTO;
use App\DTOs\Forum\UpdateTopicDTO;
use App\Models\ForumTopic;
use App\Models\User;
use App\Repositories\ForumRepository;
use App\Repositories\ForumTopicRepository;
use Illuminate\Auth\Access\AuthorizationException;

class ForumTopicService
{
    public function __construct(
        private ForumTopicRepository $repository,
        private ForumRepository $forumRepository
    ) {}

    public function create(CreateTopicDTO $dto): ?ForumTopic
    {
        if (! $this->forumRepository->findById($dto->forumId)) {
            return null;
        }

        return $this->repository->create([
            'forum_id' => $dto->forumId,
            'user_id' => $dto->userId,
            'title' => $dto->title,
            'content' => $dto->content,
        ]);
    }

    public function getByForum(int $forumId)
    {
        if (! $this->forumRepository->findById($forumId)) {
            return null;
        }

        return $this->repository->getByForum($forumId);
    }

    public function findById(int $id): ?ForumTopic
    {
        return $this->repository->findById($id);
    }

    public function update(int $id, UpdateTopicDTO $dto, User $user): ?ForumTopic
    {
        $topic = $this->repository->findById($id);

        if (! $topic) {
            return null;
        }

        if ($topic->user_id !== $user->id) {
            throw new AuthorizationException('Only the topic author can update this topic');
        }

        return $this->repository->update($topic, $dto->toArray());
    }

    public function delete(int $id, User $user): bool
    {
        $topic = $this->repository->findById($id);

        if (! $topic) {
            return false;
        }

        if ($topic->user_id !== $user->id && ! $user->isAdminOrSuperAdmin()) {
            throw new AuthorizationException('Only the topic author, Admin or SuperAdmin can delete this topic');
        }

        return $this->repository->delete($topic);
    }
}

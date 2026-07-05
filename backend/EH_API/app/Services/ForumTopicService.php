<?php

namespace App\Services;

use App\DTOs\Forum\CreateTopicDTO;
use App\DTOs\Forum\UpdateTopicDTO;
use App\Models\ForumTopic;
use App\Models\User;
use App\Repositories\ForumRepository;
use App\Repositories\ForumTopicRepository;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Collection;

class ForumTopicService
{
    public function __construct(
        private ForumTopicRepository $repository,
        private ForumRepository $forumRepository,
        private ForumService $forumService
    ) {}

    public function create(CreateTopicDTO $dto): ?ForumTopic
    {
        $forum = $this->forumRepository->findById($dto->forumId);

        if (! $forum) {
            return null;
        }

        $user = User::query()->find($dto->userId);

        if (! $user || ! $this->forumService->canViewForum($forum, $user)) {
            throw new AuthorizationException('You must be a forum member to create topics');
        }

        return $this->repository->create([
            'forum_id' => $dto->forumId,
            'user_id' => $dto->userId,
            'title' => $dto->title,
            'content' => $dto->content,
        ]);
    }

    public function getByForum(int $forumId, array $filters = [], ?User $user = null): ?Collection
    {
        $forum = $this->forumRepository->findById($forumId);

        if (! $forum) {
            return null;
        }

        if (! $this->forumService->canViewForum($forum, $user)) {
            throw new AuthorizationException('You must be a forum member to view topics');
        }

        return $this->repository->getByForum($forumId, $filters);
    }

    public function findById(int $id, ?User $user = null): ?ForumTopic
    {
        $topic = $this->repository->findById($id);

        if ($topic && ! $this->forumService->canViewForum($topic->forum, $user)) {
            throw new AuthorizationException('You must be a forum member to view this topic');
        }

        return $topic;
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

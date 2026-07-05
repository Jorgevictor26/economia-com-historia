<?php

namespace App\Services;

use App\DTOs\Forum\ReplyTopicDTO;
use App\DTOs\Forum\UpdateReplyDTO;
use App\Models\ForumReply;
use App\Models\User;
use App\Repositories\ForumReplyRepository;
use App\Repositories\ForumTopicRepository;
use Illuminate\Auth\Access\AuthorizationException;

class ForumReplyService
{
    public function __construct(
        private ForumReplyRepository $repository,
        private ForumTopicRepository $topicRepository,
        private ForumService $forumService
    ) {}

    public function create(ReplyTopicDTO $dto): ?ForumReply
    {
        $topic = $this->topicRepository->findById($dto->topicId);

        if (! $topic) {
            return null;
        }

        $user = User::query()->find($dto->userId);

        if (! $user || ! $this->forumService->canViewForum($topic->forum, $user)) {
            throw new AuthorizationException('You must be a forum member to reply');
        }

        return $this->repository->create([
            'topic_id' => $dto->topicId,
            'user_id' => $dto->userId,
            'reply' => $dto->reply,
        ]);
    }

    public function getByTopic(int $topicId, array $filters = [], ?User $user = null)
    {
        $topic = $this->topicRepository->findById($topicId);

        if (! $topic) {
            return null;
        }

        if (! $this->forumService->canViewForum($topic->forum, $user)) {
            throw new AuthorizationException('You must be a forum member to view replies');
        }

        return $this->repository->getByTopic($topicId, $filters);
    }

    public function update(int $id, UpdateReplyDTO $dto, User $user): ?ForumReply
    {
        $reply = $this->repository->findById($id);

        if (! $reply) {
            return null;
        }

        if ($reply->user_id !== $user->id) {
            throw new AuthorizationException('Only the reply author can update this reply');
        }

        return $this->repository->update($reply, $dto->toArray());
    }

    public function delete(int $id, User $user): bool
    {
        $reply = $this->repository->findById($id);

        if (! $reply) {
            return false;
        }

        if ($reply->user_id !== $user->id && ! $user->isAdminOrSuperAdmin()) {
            throw new AuthorizationException('Only the reply author, Admin or SuperAdmin can delete this reply');
        }

        return $this->repository->delete($reply);
    }
}

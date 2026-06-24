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
        private ForumTopicRepository $topicRepository
    ) {}

    public function create(ReplyTopicDTO $dto): ?ForumReply
    {
        if (! $this->topicRepository->findById($dto->topicId)) {
            return null;
        }

        return $this->repository->create([
            'topic_id' => $dto->topicId,
            'user_id' => $dto->userId,
            'reply' => $dto->reply,
        ]);
    }

    public function getByTopic(int $topicId, array $filters = [])
    {
        if (! $this->topicRepository->findById($topicId)) {
            return null;
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

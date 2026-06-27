<?php

namespace App\Services;

use App\DTOs\Comment\CreateCommentDTO;
use App\DTOs\Comment\ReplyCommentDTO;
use App\DTOs\Comment\UpdateCommentDTO;
use App\DTOs\Comment\UpdateReplyCommentDTO;
use App\Repositories\CommentRepository;
use App\Services\NotificationService;
use App\Models\Comment;
use App\Models\CommentReply;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;

class CommentService
{
    public function __construct(
        private CommentRepository $repository
        , private NotificationService $notifications
    ) {}

    public function create(CreateCommentDTO $dto)
    {
        $comment = $this->repository->create([
            'user_id' => $dto->userId,
            'content_id' => $dto->contentId,
            'comment' => $dto->comment,
        ]);

        $comment->load('content.user');

        if ($comment->content && $comment->content->user_id !== $dto->userId) {
            $this->notifications->create(
                new \App\DTOs\Notification\CreateNotificationDTO(
                    $comment->content->user_id,
                    'Novo comentário',
                    sprintf('O utilizador %s comentou no seu conteúdo.', $comment->user->name ?? 'alguém')
                )
            );
        }

        return $comment;
    }

    public function getByContent(int $contentId, array $filters = [])
    {
        return $this->repository->getByContent($contentId, $filters);
    }

    public function getById(int $id): ?Comment
    {
        return $this->repository->findById($id);
    }

    public function getReplyById(int $id): ?CommentReply
    {
        return $this->repository->findReplyById($id);
    }

    public function update(Comment $comment, UpdateCommentDTO $dto, User $actor): Comment
    {
        if (! $this->canManage($comment, $actor)) {
            throw new AuthorizationException('You are not allowed to update this comment');
        }

        return $this->repository->update($comment, $dto->toArray());
    }

    public function delete(Comment $comment, User $actor): Comment
    {
        if (! $this->canManage($comment, $actor)) {
            throw new AuthorizationException('You are not allowed to delete this comment');
        }

        return $this->repository->hide($comment);
    }

    public function updateReply(CommentReply $reply, UpdateReplyCommentDTO $dto, User $actor): CommentReply
    {
        if (! $this->canManageReply($reply, $actor)) {
            throw new AuthorizationException('You are not allowed to update this comment reply');
        }

        return $this->repository->updateReply($reply, $dto->toArray());
    }

    public function deleteReply(CommentReply $reply, User $actor): bool
    {
        if (! $this->canManageReply($reply, $actor)) {
            throw new AuthorizationException('You are not allowed to delete this comment reply');
        }

        return $this->repository->deleteReply($reply);
    }

    private function canManageReply(CommentReply $reply, User $actor): bool
    {
        if ($actor->isAdminOrSuperAdmin()) {
            return true;
        }

        return (int) $actor->id === (int) $reply->user_id;
    }

    private function canManage(Comment $comment, User $actor): bool
    {
        if ($actor->isAdminOrSuperAdmin()) {
            return true;
        }

        return (int) $actor->id === (int) $comment->user_id;
    }

    public function createReply(ReplyCommentDTO $dto)
    {
        $reply = $this->repository->createReply([
            'user_id' => $dto->userId,
            'comment_id' => $dto->commentId,
            'reply' => $dto->reply,
        ]);

        $reply->load('comment.user');

        if ($reply->comment && $reply->comment->user_id !== $dto->userId) {
            $this->notifications->create(
                new \App\DTOs\Notification\CreateNotificationDTO(
                    $reply->comment->user_id,
                    'Nova resposta',
                    sprintf('O utilizador %s respondeu ao seu comentário.', $reply->user->name ?? 'alguém')
                )
            );
        }

        return $reply;
    }
}

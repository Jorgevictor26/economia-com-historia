<?php

namespace App\Services;

use App\DTOs\Content\CreateContentDTO;
use App\DTOs\Content\UpdateContentDTO;
use App\Models\Content;
use App\Models\User;
use App\Repositories\ContentRepository;
use App\Repositories\ContentTypeRepository;
use Illuminate\Auth\Access\AuthorizationException;

class ContentService
{
    public function __construct(
        private ContentRepository $repository,
        private ContentTypeRepository $contentTypes
    ) {}

    public function create(CreateContentDTO $dto, User $actor)
    {
        if ($this->isJindungoType($dto->content_type_id) && ! $actor->hasRoleName('super-admin')) {
            throw new AuthorizationException('Only SuperAdmin users can create jindungo content');
        }

        return $this->repository->create([
            'user_id' => $dto->user_id,
            'category_id' => $dto->category_id,
            'content_type_id' => $dto->content_type_id,
            'title' => $dto->title,
            'summary' => $dto->summary,
            'content' => $dto->content,
            'image_url' => $dto->image,
            'video_url' => $dto->video,
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

    public function update(Content $content, UpdateContentDTO $dto, User $actor): Content
    {
        if ($dto->contentTypeId !== null && $this->isJindungoType($dto->contentTypeId) && ! $actor->hasRoleName('super-admin')) {
            throw new AuthorizationException('Only SuperAdmin users can set jindungo content type');
        }

        return $this->repository->update($content, $dto->toArray());
    }

    public function canAccess(Content $content, ?User $actor): bool
    {
        $content->loadMissing('contentType');

        if ($content->contentType?->slug !== 'jindungo') {
            return true;
        }

        return $actor !== null
            && ($actor->hasRoleName('super-admin') || $actor->hasActiveJindungoSubscription());
    }

    public function delete(Content $content, User $actor): bool
    {
        if (! $this->canDelete($content, $actor)) {
            throw new AuthorizationException('You are not allowed to delete this content');
        }

        return $this->repository->delete($content, $actor);
    }

    private function canDelete(Content $content, User $actor): bool
    {
        $content->loadMissing('author.roles');

        if ($actor->hasRoleName('super-admin')) {
            return true;
        }

        if ($actor->hasRoleName('admin')) {
            return (bool) $content->author?->hasRoleName('writer');
        }

        return $actor->isWriter() && (int) $content->user_id === (int) $actor->id;
    }

    private function isJindungoType(?int $contentTypeId): bool
    {
        if ($contentTypeId === null) {
            return false;
        }

        return $this->contentTypes->findById($contentTypeId)?->slug === 'jindungo';
    }
}

<?php

namespace App\Services;

use App\DTOs\Content\CreateContentDTO;
use App\DTOs\Content\UpdateContentDTO;
use App\Models\Content;
use App\Models\ContentSubscription;
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
            'image_url' => $dto->imageUrl,
            'video_url' => $dto->videoUrl,
            'visibility' => $dto->visibility
        ]);
    }

    public function getAll(array $filters = [])
    {
        if ($this->shouldIncludeJindungoForFilters($filters)) {
            $filters['include_jindungo'] = true;
        }

        return $this->repository->all($filters);
    }

    public function getSuggestions(?User $actor, int $limit = 9)
    {
        $includeJindungo = $actor?->hasRoleName('super-admin');

        return $this->repository->suggestions($actor, (bool) $includeJindungo, $limit);
    }

    public function featuredJindungo(?User $actor): ?Content
    {
        return $this->repository->featuredJindungo($actor?->id);
    }

    public function findById(int $id)
    {
        return $this->repository->findById($id);
    }

    public function registerView(Content $content): Content
    {
        return $this->repository->incrementViews($content);
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

        if ($actor === null) {
            return false;
        }

        if ($actor->hasRoleName('super-admin')) {
            return true;
        }

        return ContentSubscription::query()
            ->where('user_id', $actor->id)
            ->where('content_id', $content->id)
            ->where('status', ContentSubscription::STATUS_APPROVED)
            ->where(function ($query): void {
                $query
                    ->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->exists();
    }

    public function subscriptionStatus(Content $content, ?User $actor): string
    {
        $content->loadMissing('contentType');

        if ($content->contentType?->slug !== 'jindungo') {
            return 'available';
        }

        if ($actor?->hasRoleName('super-admin')) {
            return ContentSubscription::STATUS_APPROVED;
        }

        if (! $actor) {
            return 'available';
        }

        $subscription = ContentSubscription::query()
            ->where('user_id', $actor->id)
            ->where('content_id', $content->id)
            ->latest()
            ->first();

        if (! $subscription) {
            return 'available';
        }

        if ($subscription->status === ContentSubscription::STATUS_APPROVED
            && $subscription->expires_at !== null
            && $subscription->expires_at->isPast()) {
            return ContentSubscription::STATUS_EXPIRED;
        }

        return $subscription->status;
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

    private function shouldIncludeJindungoForFilters(array $filters): bool
    {
        if (! empty($filters['content_type_id']) && $this->isJindungoType((int) $filters['content_type_id'])) {
            return true;
        }

        if (! empty($filters['type']) && strtolower((string) $filters['type']) === 'jindungo') {
            return true;
        }

        return false;
    }
}

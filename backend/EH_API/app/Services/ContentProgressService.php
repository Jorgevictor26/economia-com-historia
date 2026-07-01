<?php

namespace App\Services;

use App\DTOs\ContentProgress\UpdateContentProgressDTO;
use App\Models\Content;
use App\Models\ContentProgress;
use App\Repositories\ContentProgressRepository;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class ContentProgressService
{
    public function __construct(private ContentProgressRepository $repository)
    {
    }

    public function latestForUser(int $userId, int $limit = 3): Collection
    {
        return $this->repository->latestByUser($userId, max(1, min($limit, 6)));
    }

    public function update(UpdateContentProgressDTO $dto): ContentProgress
    {
        if (! Content::query()->whereKey($dto->contentId)->exists()) {
            throw ValidationException::withMessages([
                'content_id' => ['Content not found.'],
            ]);
        }

        return $this->repository->updateOrCreate(
            [
                'user_id' => $dto->userId,
                'content_id' => $dto->contentId,
            ],
            [
                'progress_percent' => $dto->progressPercent,
                'last_position_seconds' => $dto->lastPositionSeconds,
                'completed_at' => $dto->progressPercent >= 100 ? now() : null,
            ]
        );
    }
}

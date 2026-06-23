<?php

namespace App\Services;

use App\DTOs\SavedContent\SaveContentDTO;
use App\Models\SavedContent;
use App\Repositories\ContentRepository;
use App\Repositories\SavedContentRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Validation\ValidationException;

class SavedContentService
{
    public function __construct(
        private SavedContentRepository $repository,
        private ContentRepository $contents
    ) {}

    public function save(SaveContentDTO $dto): SavedContent
    {
        if (! $this->contents->findById($dto->contentId)) {
            throw ValidationException::withMessages([
                'content_id' => ['Content not found.'],
            ]);
        }

        if ($this->repository->exists($dto->userId, $dto->contentId)) {
            throw ValidationException::withMessages([
                'content_id' => ['This content is already saved.'],
            ]);
        }

        return $this->repository->create([
            'user_id' => $dto->userId,
            'content_id' => $dto->contentId,
        ]);
    }

    public function getUserSavedContents(int $userId): LengthAwarePaginator
    {
        return $this->repository->getByUser($userId);
    }
}

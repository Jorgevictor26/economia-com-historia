<?php

namespace App\Services;

use App\DTOs\Content\DeleteContentMediaDTO;
use App\DTOs\Content\UploadContentMediaDTO;
use App\Models\Content;
use App\Repositories\ContentRepository;
use App\Support\ContentMedia;
use Illuminate\Auth\Access\AuthorizationException;

class ContentMediaService
{
    public function __construct(
        private ContentRepository $repository,
        private FileUploadService $uploads
    ) {}

    public function upload(UploadContentMediaDTO $dto): ?Content
    {
        $content = $this->repository->findById($dto->contentId);

        if (! $content) {
            return null;
        }

        if ((int) $content->user_id !== $dto->userId) {
            throw new AuthorizationException('Only the content author can attach files to this content');
        }

        $column = ContentMedia::columnFor($dto->mediaType);
        $this->uploads->deleteByUrl($content->{$column});

        $url = $this->uploads->upload(
            $dto->file,
            'contents/'.$content->id.'/'.$dto->mediaType
        );

        return $this->repository->updateMedia($content, $column, $url);
    }

    public function delete(DeleteContentMediaDTO $dto): ?Content
    {
        $content = $this->repository->findById($dto->contentId);

        if (! $content) {
            return null;
        }

        if (! $dto->canRemove) {
            throw new AuthorizationException('Only Admin and SuperAdmin users can remove content files');
        }

        $column = ContentMedia::columnFor($dto->mediaType);
        $this->uploads->deleteByUrl($content->{$column});

        return $this->repository->updateMedia($content, $column, null);
    }
}

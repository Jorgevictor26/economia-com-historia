<?php

namespace App\DTOs\Content;

use Illuminate\Http\UploadedFile;

readonly class UploadContentMediaDTO
{
    public function __construct(
        public int $contentId,
        public int $userId,
        public string $mediaType,
        public UploadedFile $file
    ) {}
}

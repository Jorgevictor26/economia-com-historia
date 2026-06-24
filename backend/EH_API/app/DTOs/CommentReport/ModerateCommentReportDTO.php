<?php

namespace App\DTOs\CommentReport;

readonly class ModerateCommentReportDTO
{
    public function __construct(
        public int $commentReportId,
        public int $reviewerId,
    ) {
    }
}

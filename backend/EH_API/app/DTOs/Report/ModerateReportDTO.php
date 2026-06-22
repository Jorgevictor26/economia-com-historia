<?php

namespace App\DTOs\Report;

readonly class ModerateReportDTO
{
    public function __construct(
        public int $reportId,
        public int $reviewerId,
    ) {
    }
}

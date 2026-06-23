<?php

namespace App\Services;

use App\DTOs\Report\CreateReportDTO;
use App\DTOs\Report\ModerateReportDTO;
use App\Models\Report;
use App\Repositories\ContentRepository;
use App\Repositories\ReportRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class ReportService
{
    public function __construct(
        private readonly ReportRepository $reports,
        private readonly ContentRepository $contents,
    ) {
    }

    public function create(CreateReportDTO $dto): Report
    {
        $content = $this->contents->findById($dto->contentId) ?? abort(404, 'Content not found');

        if ((int) $content->user_id === $dto->userId) {
            throw new UnprocessableEntityHttpException('You cannot report your own content');
        }

        if ($this->reports->existsForUserAndContent($dto->userId, $dto->contentId)) {
            throw new UnprocessableEntityHttpException('You have already reported this content');
        }

        return $this->reports->create($dto->toArray());
    }

    public function myReports(int $userId): LengthAwarePaginator
    {
        return $this->reports->byUser($userId);
    }

    public function all(): LengthAwarePaginator
    {
        return $this->reports->all();
    }

    public function findMyReport(int $id, int $userId): ?Report
    {
        return $this->reports->findByIdForUser($id, $userId);
    }

    public function approve(ModerateReportDTO $dto): Report
    {
        return DB::transaction(function () use ($dto): Report {
            $report = $this->findPendingReport($dto->reportId);

            if ($report->content) {
                $this->contents->updateVisibility($report->content, 'private');
            }

            return $this->reports->updateStatus($report, 'approved', $dto->reviewerId);
        });
    }

    public function reject(ModerateReportDTO $dto): Report
    {
        $report = $this->findPendingReport($dto->reportId);

        return $this->reports->updateStatus($report, 'rejected', $dto->reviewerId);
    }

    private function findPendingReport(int $reportId): Report
    {
        $report = $this->reports->findById($reportId) ?? abort(404, 'Report not found');

        if ($report->status !== 'pending') {
            throw new UnprocessableEntityHttpException('Report has already been reviewed');
        }

        return $report;
    }
}

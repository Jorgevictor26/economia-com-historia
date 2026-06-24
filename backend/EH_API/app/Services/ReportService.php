<?php

namespace App\Services;

use App\DTOs\Report\CreateReportDTO;
use App\DTOs\Report\ModerateReportDTO;
use App\Models\Report;
use App\Repositories\CommentRepository;
use App\Repositories\ReportRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class ReportService
{
    public function __construct(
        private readonly ReportRepository $reports,
        private readonly CommentRepository $comments,
    ) {
    }

    public function create(CreateReportDTO $dto): Report
    {
        return DB::transaction(function () use ($dto): Report {
            $comment = $this->comments->findById($dto->commentId) ?? abort(404, 'Comment not found');

            if ((int) $comment->user_id === $dto->userId) {
                throw new UnprocessableEntityHttpException('You cannot report your own comment');
            }

            if ($this->reports->existsForUserAndComment($dto->userId, $dto->commentId)) {
                throw new UnprocessableEntityHttpException('You have already reported this comment');
            }

            $report = $this->reports->create($dto->toArray());

            if ($this->reports->distinctUserCountForComment($dto->commentId) >= 3) {
                $this->comments->hide($comment);
            }

            return $report;
        });
    }

    public function myReports(int $userId, array $filters = []): LengthAwarePaginator
    {
        return $this->reports->byUser($userId, $filters);
    }

    public function all(array $filters = []): LengthAwarePaginator
    {
        return $this->reports->all($filters);
    }

    public function findMyReport(int $id, int $userId): ?Report
    {
        return $this->reports->findByIdForUser($id, $userId);
    }

    public function approve(ModerateReportDTO $dto): Report
    {
        return DB::transaction(function () use ($dto): Report {
            $report = $this->findPendingReport($dto->reportId);

            if ($report->comment) {
                $this->comments->hide($report->comment);
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

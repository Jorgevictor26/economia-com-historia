<?php

namespace App\Services;

use App\DTOs\CommentReport\CreateCommentReportDTO;
use App\DTOs\CommentReport\ModerateCommentReportDTO;
use App\Models\CommentReport;
use App\Repositories\CommentRepository;
use App\Repositories\CommentReportRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class CommentReportService
{
    public function __construct(
        private readonly CommentReportRepository $commentReports,
        private readonly CommentRepository $comments,
    ) {
    }

    public function create(CreateCommentReportDTO $dto): CommentReport
    {
        return DB::transaction(function () use ($dto): CommentReport {
            $comment = $this->comments->findById($dto->commentId) ?? abort(404, 'Comment not found');

            if ((int) $comment->user_id === $dto->userId) {
                throw new UnprocessableEntityHttpException('You cannot report your own comment');
            }

            if ($this->commentReports->existsForUserAndComment($dto->userId, $dto->commentId)) {
                throw new UnprocessableEntityHttpException('You have already reported this comment');
            }

            $report = $this->commentReports->create($dto->toArray());

            if ($this->commentReports->distinctUserCountForComment($dto->commentId) >= 3) {
                $this->comments->hide($comment);
            }

            return $report;
        });
    }

    public function myCommentReports(int $userId, array $filters = []): LengthAwarePaginator
    {
        return $this->commentReports->byUser($userId, $filters);
    }

    public function all(array $filters = []): LengthAwarePaginator
    {
        return $this->commentReports->all($filters);
    }

    public function findMyCommentReport(int $id, int $userId): ?CommentReport
    {
        return $this->commentReports->findByIdForUser($id, $userId);
    }

    public function approve(ModerateCommentReportDTO $dto): CommentReport
    {
        return DB::transaction(function () use ($dto): CommentReport {
            $report = $this->findPendingCommentReport($dto->commentReportId);

            if ($report->comment) {
                $this->comments->hide($report->comment);
            }

            return $this->commentReports->updateStatus($report, 'approved', $dto->reviewerId);
        });
    }

    public function reject(ModerateCommentReportDTO $dto): CommentReport
    {
        $report = $this->findPendingCommentReport($dto->commentReportId);

        return $this->commentReports->updateStatus($report, 'rejected', $dto->reviewerId);
    }

    private function findPendingCommentReport(int $commentReportId): CommentReport
    {
        $report = $this->commentReports->findById($commentReportId) ?? abort(404, 'Comment report not found');

        if ($report->status !== 'pending') {
            throw new UnprocessableEntityHttpException('Comment report has already been reviewed');
        }

        return $report;
    }
}

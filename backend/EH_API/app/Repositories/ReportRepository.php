<?php

namespace App\Repositories;

use App\Models\Report;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ReportRepository
{
    public function all(): LengthAwarePaginator
    {
        return Report::with(['user', 'content', 'reviewer'])
            ->latest()
            ->paginate(10);
    }

    public function create(array $data): Report
    {
        return Report::create($data)->load(['user', 'content']);
    }

    public function findById(int $id): ?Report
    {
        return Report::with(['user', 'content', 'reviewer'])->find($id);
    }

    public function existsForUserAndContent(int $userId, int $contentId): bool
    {
        return Report::where('user_id', $userId)
            ->where('content_id', $contentId)
            ->exists();
    }

    public function findByIdForUser(int $id, int $userId): ?Report
    {
        return Report::with(['user', 'content', 'reviewer'])
            ->where('user_id', $userId)
            ->find($id);
    }

    public function byUser(int $userId): LengthAwarePaginator
    {
        return Report::with(['content', 'reviewer'])
            ->where('user_id', $userId)
            ->latest()
            ->paginate(10);
    }

    public function updateStatus(Report $report, string $status, int $reviewerId): Report
    {
        $report->update([
            'status' => $status,
            'reviewed_by' => $reviewerId,
        ]);

        return $report->fresh(['user', 'content', 'reviewer']);
    }
}

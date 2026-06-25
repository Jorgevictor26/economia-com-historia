<?php

namespace App\Repositories;

use App\Models\CommentReport;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CommentReportRepository
{
    public function all(array $filters = []): LengthAwarePaginator
    {
        return CommentReport::with(['user', 'comment', 'reviewer'])
            ->when($filters['search'] ?? null, fn ($query, string $search) => $this->applySearch($query, $search))
            ->latest()
            ->paginate(10);
    }

    public function create(array $data): CommentReport
    {
        return CommentReport::create($data)->load(['user', 'comment']);
    }

    public function findById(int $id): ?CommentReport
    {
        return CommentReport::with(['user', 'comment', 'reviewer'])->find($id);
    }

    public function existsForUserAndComment(int $userId, int $commentId): bool
    {
        return CommentReport::where('user_id', $userId)
            ->where('comment_id', $commentId)
            ->exists();
    }

    public function findByIdForUser(int $id, int $userId): ?CommentReport
    {
        return CommentReport::with(['user', 'comment', 'reviewer'])
            ->where('user_id', $userId)
            ->find($id);
    }

    public function byUser(int $userId, array $filters = []): LengthAwarePaginator
    {
        return CommentReport::with(['comment', 'reviewer'])
            ->where('user_id', $userId)
            ->when($filters['search'] ?? null, fn ($query, string $search) => $this->applySearch($query, $search))
            ->latest()
            ->paginate(10);
    }

    public function distinctUserCountForComment(int $commentId): int
    {
        return CommentReport::where('comment_id', $commentId)
            ->distinct()
            ->count('user_id');
    }

    public function updateStatus(CommentReport $report, string $status, int $reviewerId): CommentReport
    {
        $report->update([
            'status' => $status,
            'reviewed_by' => $reviewerId,
        ]);

        return $report->fresh(['user', 'comment', 'reviewer']);
    }

    private function applySearch($query, string $search): void
    {
        $query->where(function ($searchQuery) use ($search) {
            $searchQuery
                ->where('reason', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%")
                ->orWhere('status', 'like', "%{$search}%")
                ->orWhereHas('user', fn ($userQuery) => $userQuery->where('name', 'like', "%{$search}%"))
                ->orWhereHas('comment', fn ($commentQuery) => $commentQuery->where('comment', 'like', "%{$search}%"));
        });
    }
}

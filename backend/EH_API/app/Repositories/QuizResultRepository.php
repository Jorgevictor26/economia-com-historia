<?php

namespace App\Repositories;

use App\Models\QuizResult;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class QuizResultRepository
{
    public function create(array $data): QuizResult
    {
        return QuizResult::create($data)->load(['quiz', 'user']);
    }

    public function latestByQuizAndUser(int $quizId, int $userId): ?QuizResult
    {
        return QuizResult::query()
            ->with(['quiz', 'user'])
            ->where('quiz_id', $quizId)
            ->where('user_id', $userId)
            ->latest('completed_at')
            ->first();
    }

    public function byUser(int $userId): LengthAwarePaginator
    {
        return QuizResult::query()
            ->with('quiz')
            ->where('user_id', $userId)
            ->latest('completed_at')
            ->paginate(10);
    }

    public function statsByUser(int $userId): array
    {
        $query = QuizResult::query()
            ->where('user_id', $userId);

        $completedQuizIds = (clone $query)
            ->distinct()
            ->pluck('quiz_id')
            ->map(fn (mixed $quizId): string => (string) $quizId)
            ->values()
            ->all();

        return [
            'score' => (int) (clone $query)->sum('earned_xp'),
            'completed_quizzes' => count($completedQuizIds),
            'completed_quiz_ids' => $completedQuizIds,
        ];
    }
}

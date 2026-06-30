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
        $results = QuizResult::query()
            ->with('quiz')
            ->where('user_id', $userId)
            ->get();

        $completedQuizIds = $results
            ->pluck('quiz_id')
            ->unique()
            ->map(fn (mixed $quizId): string => (string) $quizId)
            ->values()
            ->all();

        return [
            'score' => (int) $results->sum(function (QuizResult $result): int {
                if ($result->earned_xp > 0) {
                    return $result->earned_xp;
                }

                return $result->score * (int) ($result->quiz?->xp_per_question ?? 0);
            }),
            'completed_quizzes' => count($completedQuizIds),
            'completed_quiz_ids' => $completedQuizIds,
        ];
    }
}

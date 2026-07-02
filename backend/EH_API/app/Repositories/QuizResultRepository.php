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

    public function bestByQuizAndUser(int $quizId, int $userId): ?QuizResult
    {
        return QuizResult::query()
            ->with(['quiz', 'user'])
            ->where('quiz_id', $quizId)
            ->where('user_id', $userId)
            ->orderByDesc('score')
            ->orderBy('duration_seconds')
            ->first();
    }

    public function markBestForQuizAndUser(QuizResult $result): void
    {
        QuizResult::query()
            ->where('quiz_id', $result->quiz_id)
            ->where('user_id', $result->user_id)
            ->whereKeyNot($result->id)
            ->update(['is_best' => false]);

        $result->forceFill(['is_best' => true])->save();
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
            ->where('is_best', true)
            ->get();

        $completedQuizIds = $results
            ->pluck('quiz_id')
            ->unique()
            ->map(fn (mixed $quizId): string => (string) $quizId)
            ->values()
            ->all();

        return [
            'score' => (int) $results->sum('score'),
            'completed_quizzes' => count($completedQuizIds),
            'completed_quiz_ids' => $completedQuizIds,
        ];
    }

    public function bestResultsByUser(int $userId)
    {
        return QuizResult::query()
            ->with('quiz.content.category')
            ->where('user_id', $userId)
            ->where('is_best', true)
            ->get();
    }
}

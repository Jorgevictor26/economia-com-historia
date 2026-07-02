<?php

namespace App\Repositories;

use App\Models\QuizResult;
use App\Models\QuizRanking;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class QuizResultRepository
{
    public function create(array $data): QuizResult
    {
        return QuizResult::create($data)->load(['quiz', 'user', 'ranking']);
    }

    public function existsForQuizAndUser(int $quizId, int $userId): bool
    {
        return QuizResult::query()
            ->where('quiz_id', $quizId)
            ->where('user_id', $userId)
            ->exists();
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
            ->with('quiz.category')
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
            'earned_xp' => (int) $results->sum('earned_xp'),
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

    public function upsertRanking(QuizResult $result): QuizRanking
    {
        return QuizRanking::updateOrCreate(
            [
                'quiz_id' => $result->quiz_id,
                'user_id' => $result->user_id,
            ],
            [
                'quiz_result_id' => $result->id,
                'score' => $result->score,
                'earned_xp' => $result->earned_xp,
                'duration_seconds' => $result->duration_seconds,
                'completed_at' => $result->completed_at,
            ]
        )->load(['quiz', 'user']);
    }

    public function rankingByQuiz(int $quizId): LengthAwarePaginator
    {
        return QuizRanking::query()
            ->with('user')
            ->where('quiz_id', $quizId)
            ->orderByDesc('score')
            ->orderBy('duration_seconds')
            ->orderBy('completed_at')
            ->paginate(20);
    }

    public function rankingPosition(int $quizId, int $userId): ?int
    {
        $rankings = QuizRanking::query()
            ->where('quiz_id', $quizId)
            ->orderByDesc('score')
            ->orderBy('duration_seconds')
            ->orderBy('completed_at')
            ->get(['user_id']);

        $index = $rankings->search(fn (QuizRanking $ranking): bool => (int) $ranking->user_id === $userId);

        return $index === false ? null : $index + 1;
    }
}

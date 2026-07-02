<?php

namespace App\Repositories;

use App\Models\QuizAnswer;
use Illuminate\Database\Eloquent\Collection;

class QuizAnswerRepository
{
    public function create(array $data): QuizAnswer
    {
        return QuizAnswer::create($data)->load(['question', 'user']);
    }

    public function latestByQuizAndUser(int $quizId, int $userId, int $limit): Collection
    {
        return QuizAnswer::query()
            ->with('question')
            ->where('user_id', $userId)
            ->whereHas('question', fn ($query) => $query->where('quiz_id', $quizId))
            ->latest()
            ->limit($limit)
            ->get()
            ->sortBy('id')
            ->values();
    }

    public function byResult(int $resultId): Collection
    {
        return QuizAnswer::query()
            ->with('question')
            ->where('quiz_result_id', $resultId)
            ->oldest()
            ->get();
    }
}

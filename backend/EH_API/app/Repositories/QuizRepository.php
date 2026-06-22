<?php

namespace App\Repositories;

use App\Models\Quiz;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class QuizRepository
{
    public function all(): LengthAwarePaginator
    {
        return Quiz::query()
            ->with('user')
            ->withCount('questions')
            ->latest()
            ->paginate(10);
    }

    public function findById(int $id): ?Quiz
    {
        return Quiz::with(['user', 'questions'])->find($id);
    }

    public function create(array $data): Quiz
    {
        return Quiz::create($data)->load(['user', 'questions']);
    }

    public function update(Quiz $quiz, array $data): Quiz
    {
        $quiz->update($data);

        return $quiz->fresh(['user', 'questions']);
    }

    public function delete(Quiz $quiz): bool
    {
        return (bool) $quiz->delete();
    }

    public function questions(int $quizId): Collection
    {
        return Quiz::findOrFail($quizId)
            ->questions()
            ->latest()
            ->get();
    }
}

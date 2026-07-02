<?php

namespace App\Repositories;

use App\Models\Quiz;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class QuizRepository
{
    public function all(array $filters = []): LengthAwarePaginator
    {
        return Quiz::query()
            ->with(['user', 'content.category'])
            ->withCount('questions')
            ->when($filters['search'] ?? null, function ($query, string $search) {
                $query->where(function ($searchQuery) use ($search) {
                    $searchQuery
                        ->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhereHas('user', fn ($userQuery) => $userQuery->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('content', fn ($contentQuery) => $contentQuery->where('title', 'like', "%{$search}%"));
                });
            })
            ->latest()
            ->paginate(10);
    }

    public function findById(int $id): ?Quiz
    {
        return Quiz::with(['user', 'content.category', 'questions'])->find($id);
    }

    public function create(array $data): Quiz
    {
        return Quiz::create($data)->load(['user', 'content.category', 'questions']);
    }

    public function update(Quiz $quiz, array $data): Quiz
    {
        $quiz->update($data);

        return $quiz->fresh(['user', 'content.category', 'questions']);
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

    public function allByTheme(string $theme): Collection
    {
        return Quiz::query()
            ->with(['content.category'])
            ->whereHas('content.category', fn ($query) => $query->where('name', $theme))
            ->get();
    }
}

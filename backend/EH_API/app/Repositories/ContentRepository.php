<?php

namespace App\Repositories;

use App\Models\Content;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ContentRepository
{
    public function create(array $data): Content
    {
        return Content::create($data);
    }

    public function all(array $filters = [])
    {
        return $this->contentQuery($filters)
            ->when($filters['category_id'] ?? null, fn ($query, $categoryId) => $query->where('category_id', $categoryId))
            ->when($filters['content_type_id'] ?? null, fn ($query, $contentTypeId) => $query->where('content_type_id', $contentTypeId))
            ->when($filters['type'] ?? null, fn ($query, $type) => $query->whereHas('contentType', fn ($typeQuery) => $typeQuery->where('slug', $type)))
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($searchQuery) use ($search) {
                    $searchQuery
                        ->where('title', 'like', "%{$search}%")
                        ->orWhere('summary', 'like', "%{$search}%")
                        ->orWhere('content', 'like', "%{$search}%")
                        ->orWhereHas('author', fn ($authorQuery) => $authorQuery->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('category', fn ($categoryQuery) => $categoryQuery->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('contentType', fn ($typeQuery) => $typeQuery->where('name', 'like', "%{$search}%"));
                });
            })
            ->latest()
            ->paginate(10);
    }

    public function suggestions(?User $user, bool $includeJindungo, int $limit): Collection
    {
        $limit = max(1, min($limit, 12));
        $historyIds = $user ? $this->historyContentIds($user->id) : collect();
        $suggestions = collect();

        if ($historyIds->isNotEmpty()) {
            $historyContents = Content::query()
                ->whereIn('id', $historyIds)
                ->get(['id', 'category_id', 'content_type_id']);

            $categoryIds = $historyContents->pluck('category_id')->filter()->unique()->values();
            $contentTypeIds = $historyContents->pluck('content_type_id')->filter()->unique()->values();

            if ($categoryIds->isNotEmpty() || $contentTypeIds->isNotEmpty()) {
                $suggestions = $this->contentQuery([
                    'include_jindungo' => $includeJindungo,
                    'user_id' => $user->id,
                ])
                    ->whereNotIn('id', $historyIds)
                    ->where(function (Builder $query) use ($categoryIds, $contentTypeIds) {
                        $query
                            ->when($categoryIds->isNotEmpty(), fn (Builder $categoryQuery) => $categoryQuery->whereIn('category_id', $categoryIds))
                            ->when($contentTypeIds->isNotEmpty(), fn (Builder $typeQuery) => $typeQuery->orWhereIn('content_type_id', $contentTypeIds));
                    })
                    ->orderByDesc('reactions_count')
                    ->orderByDesc('views_count')
                    ->latest()
                    ->limit($limit)
                    ->get();
            }
        }

        if ($suggestions->count() < $limit) {
            $excludeIds = $historyIds
                ->merge($suggestions->pluck('id'))
                ->unique()
                ->values();

            $fallback = $this->contentQuery([
                'include_jindungo' => $includeJindungo,
                'user_id' => $user?->id,
            ])
                ->when($excludeIds->isNotEmpty(), fn (Builder $query) => $query->whereNotIn('id', $excludeIds))
                ->orderByDesc('reactions_count')
                ->orderByDesc('views_count')
                ->latest()
                ->limit($limit - $suggestions->count())
                ->get();

            $suggestions = $suggestions->merge($fallback);
        }

        return $suggestions->values();
    }

    public function findById(int $id): ?Content
    {
        return Content::with(['author.roles', 'category', 'contentType'])
            ->withCount(['reactions', 'comments'])
            ->find($id);
    }

    public function incrementViews(Content $content): Content
    {
        $content->increment('views_count');

        return $content->fresh(['author.roles', 'category', 'contentType']);
    }

    public function update(Content $content, array $data): Content
    {
        $content->update($data);

        return $content->fresh(['author', 'category', 'contentType']);
    }

    public function delete(Content $content, User $deletedBy): bool
    {
        $content->forceFill([
            'deleted_by' => $deletedBy->id,
        ])->save();

        return (bool) $content->delete();
    }

    public function updateVisibility(Content $content, string $visibility): Content
    {
        $content->update([
            'visibility' => $visibility,
        ]);

        return $content->fresh(['author', 'category', 'contentType']);
    }

    public function updateMedia(Content $content, string $column, ?string $url): Content
    {
        $updates = [
            $column => $url,
        ];

        $content->update($updates);

        return $content->fresh(['author', 'category', 'contentType']);
    }

    private function contentQuery(array $filters = []): Builder
    {
        return Content::query()
            ->with(['author', 'category', 'contentType'])
            ->withCount(['reactions', 'comments'])
            ->when($filters['user_id'] ?? null, function (Builder $query, $userId) {
                $query->withExists([
                    'reactions as liked_by_me' => fn ($reactionQuery) => $reactionQuery
                        ->where('user_id', $userId)
                        ->where('reaction_type', 'like'),
                ]);
            })
            ->when(! ($filters['include_jindungo'] ?? false), function (Builder $query) {
                $query->whereDoesntHave('contentType', fn ($typeQuery) => $typeQuery->where('slug', 'jindungo'));
            });
    }

    private function historyContentIds(int $userId): Collection
    {
        return collect()
            ->merge(DB::table('saved_contents')->where('user_id', $userId)->pluck('content_id'))
            ->merge(DB::table('reactions')->where('user_id', $userId)->pluck('content_id'))
            ->merge(DB::table('comments')->where('user_id', $userId)->pluck('content_id'))
            ->merge(
                DB::table('quiz_results')
                    ->join('quizzes', 'quiz_results.quiz_id', '=', 'quizzes.id')
                    ->where('quiz_results.user_id', $userId)
                    ->whereNotNull('quizzes.content_id')
                    ->pluck('quizzes.content_id')
            )
            ->filter()
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values();
    }
}

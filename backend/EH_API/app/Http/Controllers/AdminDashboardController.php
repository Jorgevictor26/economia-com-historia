<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\CommentReport;
use App\Models\Content;
use App\Models\Forum;
use App\Models\Notification;
use App\Models\Quiz;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $totalContents = Content::query()->count();
        $contentMix = $this->contentMix($totalContents);

        return response()->json([
            'metrics' => [
                'articles_published' => $this->publishedArticles(),
                'pending_contents' => Content::query()->where('visibility', '!=', 'public')->count(),
                'today_comments' => Comment::query()->whereDate('created_at', today())->count(),
                'today_notifications' => Notification::query()->whereDate('created_at', today())->count(),
                'active_users' => User::query()->where(function ($query): void {
                    $query->whereNull('status')->orWhere('status', '!=', 'inactive');
                })->count(),
                'total_users' => User::query()->count(),
                'total_contents' => $totalContents,
                'total_quizzes' => Quiz::query()->count(),
                'total_forums' => Forum::query()->count(),
                'pending_reports' => CommentReport::query()->where('status', 'pending')->count(),
                'private_forums' => Forum::query()
                    ->where('visibility', 'private')
                    ->orWhere('join_approval_required', true)
                    ->count(),
            ],
            'content_mix' => $contentMix,
            'activities' => $this->activities(),
        ]);
    }

    private function publishedArticles(): int
    {
        return Content::query()
            ->where('visibility', 'public')
            ->whereHas('contentType', function ($query): void {
                $query->where('slug', 'article')
                    ->orWhere('slug', 'artigo')
                    ->orWhere('slug', 'texto')
                    ->orWhere('name', 'like', '%artigo%')
                    ->orWhere('name', 'like', '%article%')
                    ->orWhere('name', 'like', '%texto%');
            })
            ->count();
    }

    private function contentMix(int $totalContents): array
    {
        $byType = Content::query()
            ->join('content_types', 'contents.content_type_id', '=', 'content_types.id')
            ->select('content_types.name as label', DB::raw('count(*) as count'))
            ->groupBy('content_types.name')
            ->orderBy('content_types.name')
            ->get()
            ->map(fn ($item): array => [
                'label' => $item->label,
                'count' => (int) $item->count,
                'value' => $this->percent((int) $item->count, max($totalContents, 1)),
            ])
            ->values()
            ->all();

        return [
            ...$byType,
            [
                'label' => 'Quizzes',
                'count' => Quiz::query()->count(),
                'value' => $this->percent(Quiz::query()->count(), max($totalContents + Quiz::query()->count(), 1)),
            ],
            [
                'label' => 'Foruns',
                'count' => Forum::query()->count(),
                'value' => $this->percent(Forum::query()->count(), max($totalContents + Forum::query()->count(), 1)),
            ],
        ];
    }

    private function activities(): array
    {
        $contents = Content::query()
            ->latest('updated_at')
            ->limit(3)
            ->get(['id', 'title', 'updated_at', 'created_at'])
            ->map(fn (Content $content): array => [
                'title' => $content->title,
                'meta' => 'Conteudo atualizado',
                'icon' => 'article',
                'tone' => 'content',
                'created_at' => $content->updated_at?->toISOString() ?? $content->created_at?->toISOString(),
            ]);

        $users = User::query()
            ->latest('created_at')
            ->limit(2)
            ->get(['id', 'name', 'created_at'])
            ->map(fn (User $user): array => [
                'title' => $user->name,
                'meta' => 'Novo utilizador',
                'icon' => 'person_add',
                'tone' => 'user',
                'created_at' => $user->created_at?->toISOString(),
            ]);

        $reports = CommentReport::query()
            ->latest('created_at')
            ->limit(2)
            ->get(['id', 'status', 'created_at'])
            ->map(fn (CommentReport $report): array => [
                'title' => 'Denuncia #'.$report->id,
                'meta' => 'Estado: '.$report->status,
                'icon' => 'flag',
                'tone' => 'report',
                'created_at' => $report->created_at?->toISOString(),
            ]);

        return $contents
            ->merge($users)
            ->merge($reports)
            ->sortByDesc('created_at')
            ->take(7)
            ->values()
            ->all();
    }

    private function percent(int $value, int $total): int
    {
        return $total > 0 ? min(100, (int) round(($value / $total) * 100)) : 0;
    }
}

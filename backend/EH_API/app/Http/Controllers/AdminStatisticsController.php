<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Content;
use App\Models\Forum;
use App\Models\ForumReply;
use App\Models\ForumTopic;
use App\Models\Quiz;
use App\Models\QuizResult;
use App\Models\Reaction;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AdminStatisticsController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $period = $request->string('period')->lower()->toString();
        $days = match ($period) {
            'diario' => 1,
            'mensal' => 30,
            default => 7,
        };
        $from = now()->subDays($days - 1)->startOfDay();

        return response()->json([
            'summary' => $this->summary($from),
            'evolution' => $this->evolution($from, $days),
            'content_views' => $this->contentViews(),
            'category_views' => $this->categoryViews(),
            'reaction_breakdown' => $this->reactionBreakdown($from),
            'comment_periods' => $this->commentPeriods(),
            'user_growth' => $this->userGrowth($from),
            'author_performance' => $this->authorPerformance(),
            'category_performance' => $this->categoryPerformance(),
            'forum_stats' => $this->forumStats($from),
            'quiz_stats' => $this->quizStats($from),
        ]);
    }

    private function summary(Carbon $from): array
    {
        $previousUsers = User::query()->where('created_at', '<', $from)->count();
        $newUsers = User::query()->where('created_at', '>=', $from)->count();
        $growth = $previousUsers > 0 ? round(($newUsers / $previousUsers) * 100, 1) : ($newUsers > 0 ? 100 : 0);

        return [
            'total_views' => (int) Content::query()->sum('views_count'),
            'total_reactions' => Reaction::query()->count(),
            'total_comments' => Comment::query()->where('created_at', '>=', $from)->count(),
            'user_growth_percent' => $growth,
        ];
    }

    private function evolution(Carbon $from, int $days): array
    {
        $rows = Content::query()
            ->selectRaw('DATE(created_at) as day, SUM(views_count) as views')
            ->where('created_at', '>=', $from)
            ->groupBy('day')
            ->pluck('views', 'day');
        $max = max((int) $rows->max(), 1);

        return collect(range(0, $days - 1))->map(function (int $offset) use ($from, $rows, $max): array {
            $date = $from->copy()->addDays($offset);
            $views = (int) ($rows[$date->toDateString()] ?? 0);

            return [
                'label' => $date->isoFormat('DD/MM'),
                'value' => $views,
                'percent' => $this->percent($views, $max),
            ];
        })->all();
    }

    private function contentViews(): array
    {
        $totalViews = max((int) Content::query()->sum('views_count'), 1);

        return Content::query()
            ->orderByDesc('views_count')
            ->limit(6)
            ->get(['title', 'views_count'])
            ->map(fn (Content $content): array => [
                'label' => $content->title,
                'value' => (int) $content->views_count,
                'detail' => $this->percent((int) $content->views_count, $totalViews).'% do total',
                'percent' => $this->percent((int) $content->views_count, max((int) Content::query()->max('views_count'), 1)),
            ])
            ->all();
    }

    private function categoryViews(): array
    {
        $rows = Content::query()
            ->join('categories', 'contents.category_id', '=', 'categories.id')
            ->select('categories.name as label', DB::raw('SUM(contents.views_count) as views'))
            ->groupBy('categories.name')
            ->orderByDesc('views')
            ->limit(6)
            ->get();
        $total = max((int) $rows->sum('views'), 1);

        return $rows->map(fn ($row): array => [
            'label' => $row->label,
            'value' => (int) $row->views,
            'detail' => $this->percent((int) $row->views, $total).'%',
            'percent' => $this->percent((int) $row->views, $total),
        ])->all();
    }

    private function reactionBreakdown(Carbon $from): array
    {
        $rows = Reaction::query()
            ->select('reaction_type as label', DB::raw('COUNT(*) as total'))
            ->groupBy('reaction_type')
            ->orderByDesc('total')
            ->get();
        $periodTotal = Reaction::query()->where('created_at', '>=', $from)->count();
        $max = max((int) $rows->max('total'), 1);

        return $rows->map(fn ($row): array => [
            'label' => ucfirst((string) $row->label),
            'value' => (int) $row->total,
            'detail' => $periodTotal.' no periodo',
            'percent' => $this->percent((int) $row->total, $max),
        ])->all();
    }

    private function commentPeriods(): array
    {
        $today = Comment::query()->whereDate('created_at', today())->count();
        $week = Comment::query()->where('created_at', '>=', now()->subDays(6)->startOfDay())->count();
        $month = Comment::query()->where('created_at', '>=', now()->subDays(29)->startOfDay())->count();
        $max = max($today, $week, $month, 1);

        return [
            ['label' => 'Hoje', 'value' => $today, 'detail' => 'Comentarios criados hoje', 'percent' => $this->percent($today, $max)],
            ['label' => 'Esta semana', 'value' => $week, 'detail' => 'Ultimos 7 dias', 'percent' => $this->percent($week, $max)],
            ['label' => 'Este mes', 'value' => $month, 'detail' => 'Ultimos 30 dias', 'percent' => $this->percent($month, $max)],
        ];
    }

    private function userGrowth(Carbon $from): array
    {
        $newUsers = User::query()->where('created_at', '>=', $from)->count();
        $activeUsers = User::query()->where(fn ($query) => $query->whereNull('status')->orWhere('status', '!=', 'inactive'))->count();
        $totalUsers = max(User::query()->count(), 1);

        return [
            ['label' => 'Novos utilizadores', 'value' => $newUsers, 'detail' => 'No periodo selecionado', 'percent' => $this->percent($newUsers, $totalUsers)],
            ['label' => 'Utilizadores ativos', 'value' => $activeUsers, 'detail' => 'Contas nao inativas', 'percent' => $this->percent($activeUsers, $totalUsers)],
            ['label' => 'Total de utilizadores', 'value' => $totalUsers, 'detail' => 'Registos na plataforma', 'percent' => 100],
        ];
    }

    private function authorPerformance(): array
    {
        return User::query()
            ->join('contents', 'users.id', '=', 'contents.user_id')
            ->leftJoin('comments', 'contents.id', '=', 'comments.content_id')
            ->leftJoin('reactions', 'contents.id', '=', 'reactions.content_id')
            ->select('users.name', DB::raw('SUM(contents.views_count) as views'), DB::raw('COUNT(DISTINCT comments.id) as comments'), DB::raw('COUNT(DISTINCT reactions.id) as reactions'))
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('views')
            ->limit(6)
            ->get()
            ->map(fn ($row): array => [
                'name' => $row->name,
                'views' => (int) $row->views,
                'engagement' => ((int) $row->comments + (int) $row->reactions).' interacoes',
                'score' => $this->percent((int) $row->comments + (int) $row->reactions, max((int) $row->views, 1)),
            ])
            ->all();
    }

    private function categoryPerformance(): array
    {
        return Content::query()
            ->join('categories', 'contents.category_id', '=', 'categories.id')
            ->leftJoin('comments', 'contents.id', '=', 'comments.content_id')
            ->leftJoin('reactions', 'contents.id', '=', 'reactions.content_id')
            ->select('categories.name', DB::raw('SUM(contents.views_count) as views'), DB::raw('COUNT(DISTINCT comments.id) as comments'), DB::raw('COUNT(DISTINCT reactions.id) as reactions'))
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('views')
            ->limit(5)
            ->get()
            ->map(fn ($row): array => [
                'name' => $row->name,
                'views' => (int) $row->views,
                'engagement' => ((int) $row->comments + (int) $row->reactions).' interacoes',
                'score' => $this->percent((int) $row->comments + (int) $row->reactions, max((int) $row->views, 1)),
            ])
            ->all();
    }

    private function forumStats(Carbon $from): array
    {
        $forums = Forum::query()->count();
        $topics = ForumTopic::query()->where('created_at', '>=', $from)->count();
        $replies = ForumReply::query()->where('created_at', '>=', $from)->count();
        $max = max($forums, $topics, $replies, 1);

        return [
            ['label' => 'Foruns ativos', 'value' => $forums, 'detail' => 'Total na plataforma', 'percent' => $this->percent($forums, $max)],
            ['label' => 'Topicos criados', 'value' => $topics, 'detail' => 'No periodo selecionado', 'percent' => $this->percent($topics, $max)],
            ['label' => 'Respostas', 'value' => $replies, 'detail' => 'No periodo selecionado', 'percent' => $this->percent($replies, $max)],
        ];
    }

    private function quizStats(Carbon $from): array
    {
        $quizzes = Quiz::query()->count();
        $attempts = QuizResult::query()->where('completed_at', '>=', $from)->count();
        $conclusions = QuizResult::query()
            ->where('completed_at', '>=', $from)
            ->whereNotNull('completed_at')
            ->count();
        $max = max($quizzes, $attempts, $conclusions, 1);

        return [
            ['label' => 'Quizzes publicados', 'value' => $quizzes, 'detail' => 'Banco de avaliacao', 'percent' => $this->percent($quizzes, $max)],
            ['label' => 'Tentativas', 'value' => $attempts, 'detail' => 'No periodo selecionado', 'percent' => $this->percent($attempts, $max)],
            ['label' => 'Conclusoes', 'value' => $conclusions, 'detail' => 'Resultados guardados', 'percent' => $this->percent($conclusions, $max)],
        ];
    }

    private function percent(int $value, int $total): int
    {
        return $total > 0 ? min(100, (int) round(($value / $total) * 100)) : 0;
    }
}

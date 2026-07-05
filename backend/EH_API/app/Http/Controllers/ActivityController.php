<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;

class ActivityController extends Controller
{
    public function history(Request $request)
    {
        $user = $request->user('sanctum');
        $limit = min(max((int) $request->integer('limit', 10), 1), 50);

        // Get recent saved contents
        $savedContents = DB::table('saved_contents')
            ->select(
                'contents.id',
                'contents.title',
                'contents.summary',
                'contents.image_url',
                'contents.created_at',
                'contents.updated_at',
                'categories.name as category',
                'content_types.name as content_type',
                'users.name as author_name',
                'saved_contents.created_at as interaction_date'
            )
            ->join('contents', 'saved_contents.content_id', '=', 'contents.id')
            ->leftJoin('categories', 'contents.category_id', '=', 'categories.id')
            ->leftJoin('content_types', 'contents.content_type_id', '=', 'content_types.id')
            ->leftJoin('users', 'contents.user_id', '=', 'users.id')
            ->where('saved_contents.user_id', $user->id)
            ->get();

        // Get reactions on contents
        $reactedContents = DB::table('reactions')
            ->select(
                'contents.id',
                'contents.title',
                'contents.summary',
                'contents.image_url',
                'contents.created_at',
                'contents.updated_at',
                'categories.name as category',
                'content_types.name as content_type',
                'users.name as author_name',
                'reactions.created_at as interaction_date'
            )
            ->join('contents', 'reactions.content_id', '=', 'contents.id')
            ->leftJoin('categories', 'contents.category_id', '=', 'categories.id')
            ->leftJoin('content_types', 'contents.content_type_id', '=', 'content_types.id')
            ->leftJoin('users', 'contents.user_id', '=', 'users.id')
            ->where('reactions.user_id', $user->id)
            ->get();

        // Combine and sort by most recent, get unique by content ID
        $recentContents = collect($savedContents)
            ->merge($reactedContents)
            ->sortByDesc('interaction_date')
            ->unique('id')
            ->take($limit)
            ->values();

        // Get recent quiz results
        $recentQuizzes = DB::table('quiz_results')
            ->select(
                'quizzes.id',
                'quizzes.title',
                'quiz_results.completed_at',
                'quiz_results.score',
                'categories.name as category'
            )
            ->join('quizzes', 'quiz_results.quiz_id', '=', 'quizzes.id')
            ->leftJoin('categories', 'quizzes.category_id', '=', 'categories.id')
            ->where('quiz_results.user_id', $user->id)
            ->orderByDesc('quiz_results.completed_at')
            ->limit(5)
            ->get();

        // Get forum activity
        $forumActivity = DB::table('forum_replies')
            ->select(
                'forum_topics.id',
                'forum_topics.title',
                'forum_replies.created_at'
            )
            ->join('forum_topics', 'forum_replies.topic_id', '=', 'forum_topics.id')
            ->where('forum_replies.user_id', $user->id)
            ->orderByDesc('forum_replies.created_at')
            ->limit(5)
            ->get();

        return response()->json([
            'data' => [
                'recent_contents' => $recentContents,
                'recent_quizzes' => $recentQuizzes,
                'forum_activity' => $forumActivity,
            ]
        ]);
    }
}

<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\GoogleLoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\Auth\RegisterController;

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\CommentReplyController;
use App\Http\Controllers\ContentController;
use App\Http\Controllers\ContentProgressController;
use App\Http\Controllers\ContentMediaController;
use App\Http\Controllers\ContentTypeController;
use App\Http\Controllers\ForumController;
use App\Http\Controllers\ForumReplyController;
use App\Http\Controllers\ForumTopicController;
use App\Http\Controllers\Api\V1\ReactionController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\AdminStatisticsController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\QuizAnswerController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\QuizProgressController;
use App\Http\Controllers\CommentReportController;
use App\Http\Controllers\SavedContentController;
use App\Http\Controllers\UserController;
use App\Support\ContentMedia;

Route::prefix('v1')->group(function () {
    Route::post('/register', RegisterController::class);
    Route::post('/login', LoginController::class);
    Route::post('/auth/google', GoogleLoginController::class);
    Route::post('/forgot-password', [PasswordResetController::class, 'forgot']);
    Route::post('/reset-password', [PasswordResetController::class, 'reset']);
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/content-types', [ContentTypeController::class, 'index']);
    Route::get('/contents', [ContentController::class, 'index']);
    Route::get('/contents/jindungo/featured', [ContentController::class, 'featuredJindungo']);
    Route::get('/contents/suggestions', [ContentController::class, 'suggestions']);
    Route::get('/contents/{id}', [ContentController::class, 'show']);
    Route::get('/quizzes', [QuizController::class, 'index']);
    Route::get('/quizzes/{id}', [QuizController::class, 'show']);
    Route::get('/quizzes/{id}/questions', [QuestionController::class, 'index']);
    Route::get('/categories/{id}', [CategoryController::class, 'show']);
    Route::get('/content-types/{id}', [ContentTypeController::class, 'show']);
    Route::get('/comments/content/{contentId}', [CommentController::class, 'indexByContent']);
    Route::get('/reactions/content/{contentId}', [ReactionController::class, 'getByContent']);
    Route::get('/reactions/content/{contentId}/count', [ReactionController::class, 'getCountByType']);
    Route::get('/forums', [ForumController::class, 'index']);
    Route::get('/forums/{id}', [ForumController::class, 'show']);
    Route::get('/forums/{forumId}/topics', [ForumTopicController::class, 'index']);
    Route::get('/topics/{id}', [ForumTopicController::class, 'show']);
    Route::get('/topics/{topicId}/replies', [ForumReplyController::class, 'index']);

    Route::middleware(['auth:sanctum', 'active'])->group(function () {
        Route::post('/logout', LogoutController::class);
        Route::get('/profile', [UserController::class, 'me']);
        Route::put('/profile', [UserController::class, 'updateProfile']);
        Route::get('/users', [UserController::class, 'index'])
            ->middleware('role:Admin,SuperAdmin');
        Route::post('/users/super-admin', [UserController::class, 'createSuperAdmin'])
            ->middleware('role:SuperAdmin');
        Route::patch('/users/{user}/roles/writer', [UserController::class, 'promoteToWriter'])
            ->middleware('role:Admin,SuperAdmin');
        Route::patch('/users/{user}/roles/admin', [UserController::class, 'promoteToAdmin'])
            ->middleware('role:SuperAdmin');
        Route::patch('/users/{user}/roles/super-admin', [UserController::class, 'promoteToSuperAdmin'])
            ->middleware('role:SuperAdmin');
        Route::patch('/users/{user}/jindungo-subscription', [UserController::class, 'updateJindungoSubscription'])
            ->middleware('role:SuperAdmin');
        Route::get('/admin/dashboard', AdminDashboardController::class)
            ->middleware('role:Admin,SuperAdmin');
        Route::get('/admin/statistics', AdminStatisticsController::class)
            ->middleware('role:Admin,SuperAdmin');
        Route::get('/my-results', [QuizAnswerController::class, 'myResults']);
        Route::get('/my-comment-reports', [CommentReportController::class, 'myCommentReports']);
        Route::get('/content-progress', [ContentProgressController::class, 'mine']);
        Route::put('/contents/{contentId}/progress', [ContentProgressController::class, 'update']);
        Route::get('/quiz-progress', [QuizProgressController::class, 'mine']);
        Route::get('/quizzes/{quizId}/progress', [QuizProgressController::class, 'show']);
        Route::put('/quizzes/{quizId}/progress', [QuizProgressController::class, 'update']);
        Route::post('/saved-contents', [SavedContentController::class, 'store']);
        Route::delete('/saved-contents/{contentId}', [SavedContentController::class, 'destroy']);
        Route::get('/my-saved-contents', [SavedContentController::class, 'mine']);

        // CATEGORIES
        Route::post('/categories', [CategoryController::class, 'store']);

        // CONTENT TYPES
        Route::post('/content-types', [ContentTypeController::class, 'store']);

        // COMMENTS
        Route::post('/comments', [CommentController::class, 'store']);
        Route::put('/comments/{id}', [CommentController::class, 'update']);
        Route::delete('/comments/{id}', [CommentController::class, 'destroy']);
        Route::post('/comments/{commentId}/reply', [CommentController::class, 'replyToComment']);
        Route::put('/comments/replies/{id}', [CommentReplyController::class, 'update']);
        Route::delete('/comments/replies/{id}', [CommentReplyController::class, 'destroy']);

        // REACTIONS
        Route::post('/reactions', [ReactionController::class, 'store']);

        // COMMENT REPORTS
        Route::post('/comment-reports', [CommentReportController::class, 'store']);
        Route::get('/comment-reports/{id}', [CommentReportController::class, 'show']);

        // CONTENT MEDIA
        Route::post('/contents/{id}/media/{mediaType}', [ContentMediaController::class, 'store'])
            ->whereIn('mediaType', ContentMedia::TYPES);

        foreach (ContentMedia::TYPES as $mediaType) {
            Route::post('/contents/{id}/upload-'.$mediaType, [ContentMediaController::class, 'store'])
                ->defaults('mediaType', $mediaType);
        }
        Route::delete('/contents/{id}/media', [ContentMediaController::class, 'destroy'])
            ->middleware('role:Admin,SuperAdmin');

        // NOTIFICATIONS
        Route::post('/notifications', [NotificationController::class, 'store']);
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);

        // FORUMS
        Route::post('/forums', [ForumController::class, 'store']);
        Route::post('/forums/{forumId}/topics', [ForumTopicController::class, 'store']);
        Route::put('/topics/{id}', [ForumTopicController::class, 'update']);
        Route::delete('/topics/{id}', [ForumTopicController::class, 'destroy']);
        Route::post('/topics/{topicId}/replies', [ForumReplyController::class, 'store']);
        Route::put('/replies/{id}', [ForumReplyController::class, 'update']);
        Route::delete('/replies/{id}', [ForumReplyController::class, 'destroy']);

        // QUIZZES
        Route::post('/quizzes/{id}/start', [QuizAnswerController::class, 'start']);
        Route::post('/quizzes/{id}/submit', [QuizAnswerController::class, 'submit']);
        Route::get('/quizzes/{id}/result', [QuizAnswerController::class, 'result']);
        Route::get('/quizzes/{id}/ranking', [QuizAnswerController::class, 'ranking']);

        Route::middleware('role:Admin,SuperAdmin')->group(function () {
            Route::get('/comment-reports', [CommentReportController::class, 'index']);
            Route::patch('/comment-reports/{id}/approve', [CommentReportController::class, 'approve']);
            Route::patch('/comment-reports/{id}/reject', [CommentReportController::class, 'reject']);

            Route::get('/forum-approvals', [ForumController::class, 'moderationIndex']);
            Route::patch('/forums/{id}/approve', [ForumController::class, 'approve']);
            Route::patch('/forums/{id}/reject', [ForumController::class, 'reject']);
            Route::put('/forums/{id}', [ForumController::class, 'update']);
            Route::delete('/forums/{id}', [ForumController::class, 'destroy']);
        });

        Route::middleware('role:Admin,SuperAdmin,Writer')->group(function () {
            Route::post('/contents', [ContentController::class, 'store']);
            Route::put('/contents/{id}', [ContentController::class, 'update']);
            Route::delete('/contents/{id}', [ContentController::class, 'destroy']);

            Route::post('/quizzes', [QuizController::class, 'store']);
            Route::put('/quizzes/{id}', [QuizController::class, 'update']);
            Route::delete('/quizzes/{id}', [QuizController::class, 'destroy']);
            Route::post('/quizzes/{id}/questions', [QuestionController::class, 'store']);
            Route::put('/questions/{id}', [QuestionController::class, 'update']);
            Route::delete('/questions/{id}', [QuestionController::class, 'destroy']);
        });
    });
});

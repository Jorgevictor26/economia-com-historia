<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\RegisterController;

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\ContentController;
use App\Http\Controllers\ContentTypeController;
use App\Http\Controllers\Api\V1\ReactionController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\QuizAnswerController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\UserController;

Route::prefix('v1')->group(function () {
    Route::post('/register', RegisterController::class);
    Route::post('/login', LoginController::class);
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/content-types', [ContentTypeController::class, 'index']);
    Route::get('/contents', [ContentController::class, 'index']);
    Route::get('/contents/{id}', [ContentController::class, 'show']);
    Route::get('/quizzes', [QuizController::class, 'index']);
    Route::get('/quizzes/{id}', [QuizController::class, 'show']);
    Route::get('/quizzes/{id}/questions', [QuestionController::class, 'index']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', LogoutController::class);
        Route::get('/profile', [UserController::class, 'me']);
        Route::put('/profile', [UserController::class, 'updateProfile']);
        Route::get('/my-results', [QuizAnswerController::class, 'myResults']);
        Route::get('/my-reports', [ReportController::class, 'myReports']);

        // CONTENTS
        Route::post('/contents', [ContentController::class, 'store']);

        // CATEGORIES
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::get('/categories/{id}', [CategoryController::class, 'show']);

        // CONTENT TYPES
        Route::post('/content-types', [ContentTypeController::class, 'store']);
        Route::get('/content-types/{id}', [ContentTypeController::class, 'show']);

        // COMMENTS
        Route::post('/comments', [CommentController::class, 'store']);
        Route::get('/comments/content/{contentId}', [CommentController::class, 'indexByContent']);
        Route::post('/comments/{commentId}/reply', [CommentController::class, 'replyToComment']);

        // REACTIONS
        Route::post('/reactions', [ReactionController::class, 'store']);
        Route::get('/reactions/content/{contentId}', [ReactionController::class, 'getByContent']);
        Route::get('/reactions/content/{contentId}/count', [ReactionController::class, 'getCountByType']);

        // REPORTS
        Route::post('/reports', [ReportController::class, 'store']);
        Route::get('/reports/{id}', [ReportController::class, 'show']);

        // NOTIFICATIONS
        Route::post('/notifications', [NotificationController::class, 'store']);
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);

        // QUIZZES
        Route::post('/quizzes/{id}/submit', [QuizAnswerController::class, 'submit']);
        Route::get('/quizzes/{id}/result', [QuizAnswerController::class, 'result']);

        Route::middleware('role:Admin,SuperAdmin')->group(function () {
            Route::get('/reports', [ReportController::class, 'index']);
            Route::patch('/reports/{id}/approve', [ReportController::class, 'approve']);
            Route::patch('/reports/{id}/reject', [ReportController::class, 'reject']);

            Route::post('/quizzes', [QuizController::class, 'store']);
            Route::put('/quizzes/{id}', [QuizController::class, 'update']);
            Route::delete('/quizzes/{id}', [QuizController::class, 'destroy']);
            Route::post('/quizzes/{id}/questions', [QuestionController::class, 'store']);
        });
    });
});

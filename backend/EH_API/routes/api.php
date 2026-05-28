<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\RegisterController;

use App\Http\Controllers\ContentController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\CommentController;
use App\Http\Controllers\Api\V1\ReactionController;

Route::prefix('v1')->group(function () {
    Route::post('/register', RegisterController::class);
    Route::post('/login', LoginController::class);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', LogoutController::class);

        // CONTENTS
        Route::get('/contents', [ContentController::class, 'index']);
        Route::post('/contents', [ContentController::class, 'store']);
        Route::get('/contents/{id}', [ContentController::class, 'show']);

        // CATEGORIES
        Route::get('/categories', [CategoryController::class, 'index']);
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::get('/categories/{id}', [CategoryController::class, 'show']);

        // COMMENTS
        Route::post('/comments', [CommentController::class, 'store']);
        Route::get('/comments/content/{contentId}', [CommentController::class, 'indexByContent']);
        Route::post('/comments/{commentId}/reply', [CommentController::class, 'replyToComment']);

        // REACTIONS
        Route::post('/reactions', [ReactionController::class, 'store']);
        Route::get('/reactions/content/{contentId}', [ReactionController::class, 'getByContent']);
        Route::get('/reactions/content/{contentId}/count', [ReactionController::class, 'getCountByType']);
    });
});

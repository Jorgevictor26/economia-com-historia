<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\RegisterController;

use App\Http\Controllers\ContentController;
use App\Http\Controllers\CategoryController;

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', LogoutController::class);

    // CONTENTS
    Route::get('/contents', [
        ContentController::class,
        'index'
    ]);

    Route::post('/contents', [
        ContentController::class,
        'store'
    ]);

    Route::get('/contents/{id}', [
        ContentController::class,
        'show'
    ]);

    // CATEGORIES
    Route::get('/categories', [
        CategoryController::class,
        'index'
    ]);

    Route::post('/categories', [
        CategoryController::class,
        'store'
    ]);

    Route::get('/categories/{id}', [
        CategoryController::class,
        'show'
    ]);

});

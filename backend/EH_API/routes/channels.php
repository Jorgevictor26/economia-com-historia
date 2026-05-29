<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, int $id) {
    return (int) $user->id === $id;
});

// additional convenience channel: `user.{id}`
Broadcast::channel('user.{id}', function ($user, int $id) {
    return (int) $user->id === $id;
});

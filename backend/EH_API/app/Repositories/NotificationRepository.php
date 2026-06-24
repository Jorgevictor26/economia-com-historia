<?php

namespace App\Repositories;

use App\Models\Notification;

class NotificationRepository
{
    public function create(array $data): Notification
    {
        return Notification::create($data);
    }

    public function getByUser(int $userId, array $filters = [])
    {
        return Notification::query()
        ->where('user_id', $userId)
        ->when($filters['search'] ?? null, function ($query, string $search) {
            $query->where(function ($searchQuery) use ($search) {
                $searchQuery
                    ->where('title', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%");
            });
        })
        ->latest()
        ->get();
    }

    public function markAsRead(int $id)
    {
        $notification = Notification::find($id);

        if ($notification) {

            $notification->update([
                'is_read' => true
            ]);
        }

        return $notification;
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use App\Http\Requests\Notification\StoreNotificationRequest;

use App\Services\NotificationService;
use App\DTOs\Notification\CreateNotificationDTO;

class NotificationController extends Controller
{
    public function __construct(
        private NotificationService $service
    ) {}

    public function store(StoreNotificationRequest $request)
    {
        $dto = new CreateNotificationDTO(
            Auth::id(),
            $request->title,
            $request->message
        );

        $notification = $this->service->create($dto);

        return response()->json([
            'message' => 'Notification created successfully',
            'data' => $notification
        ], 201);
    }

    public function index()
    {
        return response()->json(
            $this->service->getByUser(
                Auth::id()
            )
        );
    }

    public function markAsRead(
        int $id
    )
    {
        return response()->json([
            'message' =>
                'Notification marked as read',
            'data' =>
                $this->service
                    ->markAsRead($id)
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Http\Requests\Notification\StoreNotificationRequest;
use Illuminate\Http\Request;

use App\Services\NotificationService;
use App\DTOs\Notification\CreateNotificationDTO;

class NotificationController extends Controller
{
    public function __construct(
        private NotificationService $service
    ) {}

    public function store(StoreNotificationRequest $request)
    {
        $data = $request->validated();

        $dto = new CreateNotificationDTO(
            $request->user()->id,
            $data['title'],
            $data['message']
        );

        $notification = $this->service->create($dto);

        return response()->json([
            'message' => 'Notification created successfully',
            'data' => $notification
        ], 201);
    }

    public function index(Request $request)
    {
        return response()->json(
            $this->service->getByUser(
                $request->user()->id
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

<?php

namespace App\Http\Controllers;

use App\DTOs\Forum\CreateForumDTO;
use App\DTOs\Forum\UpdateForumDTO;
use App\Http\Requests\Forum\StoreForumRequest;
use App\Http\Requests\Forum\UpdateForumRequest;
use App\Services\ForumService;
use Illuminate\Http\JsonResponse;

class ForumController extends Controller
{
    public function __construct(
        private ForumService $service
    ) {}

    public function index(): JsonResponse
    {
        return response()->json($this->service->getAll());
    }

    public function store(StoreForumRequest $request): JsonResponse
    {
        $forum = $this->service->create(new CreateForumDTO(
            $request->string('name')->toString(),
            $request->input('description')
        ));

        return response()->json([
            'message' => 'Forum created successfully',
            'data' => $forum,
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $forum = $this->service->findById($id);

        if (! $forum) {
            return response()->json(['message' => 'Forum not found'], 404);
        }

        return response()->json($forum);
    }

    public function update(UpdateForumRequest $request, int $id): JsonResponse
    {
        $forum = $this->service->update($id, new UpdateForumDTO(
            $request->has('name') ? $request->string('name')->toString() : null,
            $request->has('description') ? $request->input('description') : null,
            $request->has('name'),
            $request->has('description')
        ));

        if (! $forum) {
            return response()->json(['message' => 'Forum not found'], 404);
        }

        return response()->json([
            'message' => 'Forum updated successfully',
            'data' => $forum,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        if (! $this->service->delete($id)) {
            return response()->json(['message' => 'Forum not found'], 404);
        }

        return response()->json(['message' => 'Forum deleted successfully']);
    }
}

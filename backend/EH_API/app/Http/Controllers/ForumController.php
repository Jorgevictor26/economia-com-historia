<?php

namespace App\Http\Controllers;

use App\DTOs\Forum\CreateForumDTO;
use App\DTOs\Forum\UpdateForumDTO;
use App\Http\Requests\Forum\StoreForumRequest;
use App\Http\Requests\Forum\UpdateForumRequest;
use App\Services\ForumService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ForumController extends Controller
{
    public function __construct(
        private ForumService $service
    ) {}

    public function index(Request $request): JsonResponse
    {
        return response()->json(
            $this->service->getAll($request->only('search'))
        );
    }

    public function moderationIndex(Request $request): JsonResponse
    {
        return response()->json(
            $this->service->getAllForModeration($request->only(['search', 'status']))
        );
    }

    public function store(StoreForumRequest $request): JsonResponse
    {
        $forum = $this->service->create(new CreateForumDTO(
            $request->user()->id,
            $request->string('name')->toString(),
            $request->input('description'),
            $request->input('rules'),
            $request->input('category'),
            $request->input('image'),
            $request->input('visibility', 'public'),
            $request->input('content_permission', 'public'),
            (bool) $request->boolean('allow_attachments'),
            $request->input('content_ids', [])
        ));

        return response()->json([
            'message' => 'Forum created successfully and is pending approval',
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

    public function approve(Request $request, int $id): JsonResponse
    {
        $forum = $this->service->approve($id, $request->user()->id);

        if (! $forum) {
            return response()->json(['message' => 'Forum not found'], 404);
        }

        return response()->json([
            'message' => 'Forum approved successfully',
            'data' => $forum,
        ]);
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        $forum = $this->service->reject($id, $request->user()->id);

        if (! $forum) {
            return response()->json(['message' => 'Forum not found'], 404);
        }

        return response()->json([
            'message' => 'Forum rejected successfully',
            'data' => $forum,
        ]);
    }
}

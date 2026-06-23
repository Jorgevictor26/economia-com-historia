<?php

namespace App\Http\Controllers;

use App\DTOs\Forum\CreateTopicDTO;
use App\DTOs\Forum\UpdateTopicDTO;
use App\Http\Requests\Forum\StoreTopicRequest;
use App\Http\Requests\Forum\UpdateTopicRequest;
use App\Services\ForumTopicService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ForumTopicController extends Controller
{
    public function __construct(
        private ForumTopicService $service
    ) {}

    public function index(int $forumId): JsonResponse
    {
        $topics = $this->service->getByForum($forumId);

        if (is_null($topics)) {
            return response()->json(['message' => 'Forum not found'], 404);
        }

        return response()->json($topics);
    }

    public function store(StoreTopicRequest $request, int $forumId): JsonResponse
    {
        $topic = $this->service->create(new CreateTopicDTO(
            $forumId,
            $request->user()->id,
            $request->string('title')->toString(),
            $request->string('content')->toString()
        ));

        if (! $topic) {
            return response()->json(['message' => 'Forum not found'], 404);
        }

        return response()->json([
            'message' => 'Topic created successfully',
            'data' => $topic,
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $topic = $this->service->findById($id);

        if (! $topic) {
            return response()->json(['message' => 'Topic not found'], 404);
        }

        return response()->json($topic);
    }

    public function update(UpdateTopicRequest $request, int $id): JsonResponse
    {
        try {
            $topic = $this->service->update($id, new UpdateTopicDTO(
                $request->has('title') ? $request->string('title')->toString() : null,
                $request->has('content') ? $request->string('content')->toString() : null,
                $request->has('title'),
                $request->has('content')
            ), $request->user());
        } catch (AuthorizationException $exception) {
            return response()->json(['message' => $exception->getMessage()], 403);
        }

        if (! $topic) {
            return response()->json(['message' => 'Topic not found'], 404);
        }

        return response()->json([
            'message' => 'Topic updated successfully',
            'data' => $topic,
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        try {
            $deleted = $this->service->delete($id, $request->user());
        } catch (AuthorizationException $exception) {
            return response()->json(['message' => $exception->getMessage()], 403);
        }

        if (! $deleted) {
            return response()->json(['message' => 'Topic not found'], 404);
        }

        return response()->json(['message' => 'Topic deleted successfully']);
    }
}

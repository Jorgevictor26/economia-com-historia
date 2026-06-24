<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;

use App\Http\Requests\Content\StoreContentRequest;
use App\Http\Requests\Content\UpdateContentRequest;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;

use App\Services\ContentService;

use App\DTOs\Content\CreateContentDTO;
use App\DTOs\Content\UpdateContentDTO;

class ContentController extends Controller
{
    public function __construct(
        private ContentService $service
    ) {}

    public function index(Request $request)
    {
        return response()->json(
            $this->service->getAll($request->only([
                'category_id',
                'content_type_id',
                'type',
                'search',
            ]))
        );
    }

    public function store(StoreContentRequest $request)
    {
        if (! $this->canCreateContent($request)) {
            return $this->forbiddenResponse();
        }

        $dto = new CreateContentDTO(
            $request->user()->id,
            $request->validated('category_id'),
            $request->validated('content_type_id'),
            $request->validated('title'),
            $request->validated('summary'),
            $request->validated('content'),
            $request->validated('image'),
            $request->validated('video'),
            $request->validated('visibility')
        );

        $content = $this->service->create($dto);

        return response()->json([
            'message' => 'Content created successfully',
            'data' => $content
        ], 201);
    }

    public function show(int $id)
    {
        $content = $this->service->findById($id);

        if (!$content) {
            return response()->json([
                'message' => 'Content not found'
            ], 404);
        }

        return response()->json($content);
    }

    public function update(UpdateContentRequest $request, int $id)
    {
        $content = $this->service->findById($id);

        if (! $content) {
            return response()->json([
                'message' => 'Content not found'
            ], 404);
        }

        if (! $this->canManageContent($request, $content->user_id)) {
            return $this->forbiddenResponse();
        }

        return response()->json([
            'message' => 'Content updated successfully',
            'data' => $this->service->update(
                $content,
                UpdateContentDTO::fromArray($request->validated())
            ),
        ]);
    }

    public function destroy(Request $request, int $id)
    {
        $content = $this->service->findById($id);

        if (! $content) {
            return response()->json([
                'message' => 'Content not found'
            ], 404);
        }

        try {
            $this->service->delete($content, $request->user());
        } catch (AuthorizationException) {
            return $this->forbiddenResponse();
        }

        return response()->json([
            'message' => 'Content deleted successfully',
        ]);
    }

    private function canCreateContent(Request $request): bool
    {
        $user = $request->user();

        return $user && ($user->isAdminOrSuperAdmin() || $user->isWriter());
    }

    private function canManageContent(Request $request, int $ownerId): bool
    {
        $user = $request->user();

        if (! $user) {
            return false;
        }

        return $user->isAdminOrSuperAdmin()
            || ($user->isWriter() && (int) $user->id === $ownerId);
    }

    private function forbiddenResponse()
    {
        return response()->json([
            'message' => 'You are not allowed to manage this content',
        ], 403);
    }
}

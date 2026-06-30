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
        $user = $request->user('sanctum');
        $includeJindungo = $user?->hasRoleName('super-admin') || $user?->hasActiveJindungoSubscription();

        return response()->json(
            $this->service->getAll(array_merge($request->only([
                'category_id',
                'content_type_id',
                'type',
                'search',
            ]), [
                'include_jindungo' => (bool) $includeJindungo,
                'user_id' => $user?->id,
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
            $request->validated('image_url'),
            $request->validated('video_url'),
            $request->validated('visibility')
        );

        try {
            $content = $this->service->create($dto, $request->user());
        } catch (AuthorizationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 403);
        }

        return response()->json([
            'message' => 'Content created successfully',
            'data' => $content
        ], 201);
    }

    public function show(Request $request, int $id)
    {
        $content = $this->service->findById($id);

        if (!$content) {
            return response()->json([
                'message' => 'Content not found'
            ], 404);
        }

        if (! $this->service->canAccess($content, $request->user('sanctum'))) {
            return response()->json([
                'message' => 'An active jindungo subscription is required to access this content',
            ], 403);
        }

        $content = $this->service->registerView($content);
        $content->loadCount(['reactions', 'comments']);

        $content->setAttribute('liked_by_me', (bool) $request->user('sanctum')?->id && $content->reactions()
            ->where('user_id', $request->user('sanctum')->id)
            ->where('reaction_type', 'like')
            ->exists());

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

        try {
            $content = $this->service->update(
                $content,
                UpdateContentDTO::fromArray($request->validated()),
                $request->user()
            );
        } catch (AuthorizationException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 403);
        }

        return response()->json([
            'message' => 'Content updated successfully',
            'data' => $content,
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

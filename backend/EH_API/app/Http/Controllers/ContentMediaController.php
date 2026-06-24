<?php

namespace App\Http\Controllers;

use App\DTOs\Content\DeleteContentMediaDTO;
use App\DTOs\Content\UploadContentMediaDTO;
use App\Http\Requests\Content\DeleteContentMediaRequest;
use App\Http\Requests\Content\UploadContentMediaRequest;
use App\Services\ContentMediaService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;

class ContentMediaController extends Controller
{
    public function __construct(
        private ContentMediaService $service
    ) {}

    public function store(UploadContentMediaRequest $request, int $id): JsonResponse
    {
        try {
            $content = $this->service->upload(new UploadContentMediaDTO(
                $id,
                $request->user()->id,
                $request->mediaType(),
                $request->mediaFile()
            ));
        } catch (AuthorizationException $exception) {
            return response()->json(['message' => $exception->getMessage()], 403);
        }

        if (! $content) {
            return response()->json(['message' => 'Content not found'], 404);
        }

        return response()->json([
            'message' => 'Content media uploaded successfully',
            'data' => $content,
        ], 201);
    }

    public function destroy(DeleteContentMediaRequest $request, int $id): JsonResponse
    {
        try {
            $content = $this->service->delete(new DeleteContentMediaDTO(
                $id,
                $request->user()->id,
                $request->validated('media_type'),
                $request->user()->isAdminOrSuperAdmin()
            ));
        } catch (AuthorizationException $exception) {
            return response()->json(['message' => $exception->getMessage()], 403);
        }

        if (! $content) {
            return response()->json(['message' => 'Content not found'], 404);
        }

        return response()->json([
            'message' => 'Content media removed successfully',
            'data' => $content,
        ]);
    }
}

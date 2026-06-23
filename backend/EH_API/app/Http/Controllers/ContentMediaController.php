<?php

namespace App\Http\Controllers;

use App\DTOs\Content\DeleteContentMediaDTO;
use App\DTOs\Content\UploadContentMediaDTO;
use App\Http\Requests\Content\DeleteContentMediaRequest;
use App\Http\Requests\Content\UploadContentAudioRequest;
use App\Http\Requests\Content\UploadContentDocumentRequest;
use App\Http\Requests\Content\UploadContentImageRequest;
use App\Http\Requests\Content\UploadContentVideoRequest;
use App\Services\ContentMediaService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\UploadedFile;

class ContentMediaController extends Controller
{
    public function __construct(
        private ContentMediaService $service
    ) {}

    public function uploadImage(UploadContentImageRequest $request, int $id): JsonResponse
    {
        return $this->upload($id, $request->user()->id, 'image', $request->file('image'));
    }

    public function uploadVideo(UploadContentVideoRequest $request, int $id): JsonResponse
    {
        return $this->upload($id, $request->user()->id, 'video', $request->file('video'));
    }

    public function uploadAudio(UploadContentAudioRequest $request, int $id): JsonResponse
    {
        return $this->upload($id, $request->user()->id, 'audio', $request->file('audio'));
    }

    public function uploadDocument(UploadContentDocumentRequest $request, int $id): JsonResponse
    {
        return $this->upload($id, $request->user()->id, 'document', $request->file('document'));
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

    private function upload(int $contentId, int $userId, string $mediaType, UploadedFile $file): JsonResponse
    {
        try {
            $content = $this->service->upload(new UploadContentMediaDTO(
                $contentId,
                $userId,
                $mediaType,
                $file
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
}

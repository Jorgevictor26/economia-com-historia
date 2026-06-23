<?php

namespace App\Http\Controllers;

use App\DTOs\SavedContent\RemoveSavedContentDTO;
use App\DTOs\SavedContent\SaveContentDTO;
use App\Http\Requests\SavedContent\DestroySavedContentRequest;
use App\Http\Requests\SavedContent\StoreSavedContentRequest;
use App\Services\SavedContentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class SavedContentController extends Controller
{
    public function __construct(
        private SavedContentService $service
    ) {}

    public function store(StoreSavedContentRequest $request): JsonResponse
    {
        try {
            $savedContent = $this->service->save(new SaveContentDTO(
                $request->user()->id,
                $request->integer('content_id')
            ));
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => 'Unable to save content',
                'errors' => $exception->errors(),
            ], 409);
        }

        return response()->json([
            'message' => 'Content saved successfully',
            'data' => $savedContent,
        ], 201);
    }

    public function mine(Request $request): JsonResponse
    {
        return response()->json(
            $this->service->getUserSavedContents($request->user()->id)
        );
    }

    public function destroy(DestroySavedContentRequest $request, int $contentId): JsonResponse
    {
        try {
            $this->service->remove(new RemoveSavedContentDTO(
                $request->user()->id,
                $contentId
            ));
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => 'Unable to remove saved content',
                'errors' => $exception->errors(),
            ], 404);
        }

        return response()->json([
            'message' => 'Saved content removed successfully',
        ]);
    }
}

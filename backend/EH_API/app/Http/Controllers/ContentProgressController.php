<?php

namespace App\Http\Controllers;

use App\DTOs\ContentProgress\UpdateContentProgressDTO;
use App\Http\Requests\ContentProgress\UpdateContentProgressRequest;
use App\Services\ContentProgressService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ContentProgressController extends Controller
{
    public function __construct(private ContentProgressService $service)
    {
    }

    public function mine(Request $request): JsonResponse
    {
        $limit = min(max((int) $request->integer('limit', 3), 1), 6);

        return response()->json($this->service->latestForUser($request->user()->id, $limit));
    }

    public function update(UpdateContentProgressRequest $request, int $contentId): JsonResponse
    {
        try {
            $progress = $this->service->update(new UpdateContentProgressDTO(
                userId: $request->user()->id,
                contentId: $contentId,
                progressPercent: $request->integer('progress_percent'),
                lastPositionSeconds: $request->has('last_position_seconds') ? $request->integer('last_position_seconds') : null,
            ));
        } catch (ValidationException $exception) {
            return response()->json([
                'message' => 'Unable to update progress',
                'errors' => $exception->errors(),
            ], 404);
        }

        return response()->json([
            'message' => 'Progress updated successfully',
            'data' => $progress,
        ]);
    }
}

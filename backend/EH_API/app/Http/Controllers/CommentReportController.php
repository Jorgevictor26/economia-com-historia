<?php

namespace App\Http\Controllers;

use App\DTOs\CommentReport\CreateCommentReportDTO;
use App\DTOs\CommentReport\ModerateCommentReportDTO;
use App\Http\Requests\CommentReport\ModerateCommentReportRequest;
use App\Http\Requests\CommentReport\StoreCommentReportRequest;
use App\Services\CommentReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentReportController extends Controller
{
    public function __construct(
        private readonly CommentReportService $commentReports
    ) {
    }

    public function store(StoreCommentReportRequest $request): JsonResponse
    {
        $report = $this->commentReports->create(
            CreateCommentReportDTO::fromArray($request->validated(), $request->user()->id)
        );

        return response()->json([
            'message' => 'Comment report created successfully',
            'data' => $report,
        ], 201);
    }

    public function index(Request $request): JsonResponse
    {
        return response()->json(
            $this->commentReports->all($request->only(['search', 'status', 'per_page']))
        );
    }

    public function myCommentReports(Request $request): JsonResponse
    {
        return response()->json(
            $this->commentReports->myCommentReports($request->user()->id, $request->only('search'))
        );
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $report = $this->commentReports->findMyCommentReport($id, $request->user()->id);

        if (! $report) {
            return response()->json([
                'message' => 'Comment report not found',
            ], 404);
        }

        return response()->json([
            'data' => $report,
        ]);
    }

    public function approve(ModerateCommentReportRequest $request, int $id): JsonResponse
    {
        $report = $this->commentReports->approve(
            new ModerateCommentReportDTO($id, $request->user()->id)
        );

        return response()->json([
            'message' => 'Comment report approved successfully',
            'data' => $report,
        ]);
    }

    public function reject(ModerateCommentReportRequest $request, int $id): JsonResponse
    {
        $report = $this->commentReports->reject(
            new ModerateCommentReportDTO($id, $request->user()->id)
        );

        return response()->json([
            'message' => 'Comment report rejected successfully',
            'data' => $report,
        ]);
    }
}

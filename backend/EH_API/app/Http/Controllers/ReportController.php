<?php

namespace App\Http\Controllers;

use App\DTOs\Report\CreateReportDTO;
use App\DTOs\Report\ModerateReportDTO;
use App\Http\Requests\Report\ModerateReportRequest;
use App\Http\Requests\Report\StoreReportRequest;
use App\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct(
        private readonly ReportService $reports
    ) {
    }

    public function store(StoreReportRequest $request): JsonResponse
    {
        $report = $this->reports->create(
            CreateReportDTO::fromArray($request->validated(), $request->user()->id)
        );

        return response()->json([
            'message' => 'Report created successfully',
            'data' => $report,
        ], 201);
    }

    public function index(Request $request): JsonResponse
    {
        return response()->json(
            $this->reports->all($request->only('search'))
        );
    }

    public function myReports(Request $request): JsonResponse
    {
        return response()->json(
            $this->reports->myReports($request->user()->id, $request->only('search'))
        );
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $report = $this->reports->findMyReport($id, $request->user()->id);

        if (! $report) {
            return response()->json([
                'message' => 'Report not found',
            ], 404);
        }

        return response()->json([
            'data' => $report,
        ]);
    }

    public function approve(ModerateReportRequest $request, int $id): JsonResponse
    {
        $report = $this->reports->approve(
            new ModerateReportDTO($id, $request->user()->id)
        );

        return response()->json([
            'message' => 'Report approved successfully',
            'data' => $report,
        ]);
    }

    public function reject(ModerateReportRequest $request, int $id): JsonResponse
    {
        $report = $this->reports->reject(
            new ModerateReportDTO($id, $request->user()->id)
        );

        return response()->json([
            'message' => 'Report rejected successfully',
            'data' => $report,
        ]);
    }
}

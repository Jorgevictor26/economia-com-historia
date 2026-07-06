<?php

namespace App\Http\Controllers;

use App\Models\Content;
use App\Models\ContentSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContentSubscriptionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ContentSubscription::query()
            ->with(['user.roles', 'content.contentType', 'content.category', 'reviewer'])
            ->when($request->query('status'), fn ($builder, string $status) => $builder->where('status', $status))
            ->when($request->query('search'), function ($builder, string $search): void {
                $builder->where(function ($searchQuery) use ($search): void {
                    $searchQuery
                        ->whereHas('user', fn ($userQuery) => $userQuery
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%"))
                        ->orWhereHas('content', fn ($contentQuery) => $contentQuery
                            ->where('title', 'like', "%{$search}%"));
                });
            })
            ->latest();

        return response()->json($query->get());
    }

    public function mine(Request $request): JsonResponse
    {
        return response()->json(
            ContentSubscription::query()
                ->with(['content.contentType', 'content.category'])
                ->where('user_id', $request->user()->id)
                ->latest()
                ->get()
        );
    }

    public function store(Request $request, Content $content): JsonResponse
    {
        $content->loadMissing('contentType');

        if ($content->contentType?->slug !== 'jindungo') {
            return response()->json([
                'message' => 'Only Jindungo texts can be subscribed',
            ], 422);
        }

        $subscription = ContentSubscription::query()
            ->where('user_id', $request->user()->id)
            ->where('content_id', $content->id)
            ->first();

        if (! $subscription || in_array($subscription->status, [ContentSubscription::STATUS_REJECTED, ContentSubscription::STATUS_EXPIRED], true)) {
            $subscription = ContentSubscription::query()->updateOrCreate(
                [
                    'user_id' => $request->user()->id,
                    'content_id' => $content->id,
                ],
                [
                    'status' => ContentSubscription::STATUS_PENDING,
                    'requested_at' => now(),
                    'approved_at' => null,
                    'rejected_at' => null,
                    'expires_at' => null,
                    'reviewed_by' => null,
                ]
            );
        }

        return response()->json([
            'message' => 'Pedido de subscrição registado com sucesso',
            'data' => $subscription->fresh(['user.roles', 'content.contentType', 'content.category']),
        ], 201);
    }

    public function approve(Request $request, ContentSubscription $subscription): JsonResponse
    {
        $expiresAt = now()->addYear();

        $subscription->update([
            'status' => ContentSubscription::STATUS_APPROVED,
            'approved_at' => now(),
            'rejected_at' => null,
            'expires_at' => $expiresAt,
            'reviewed_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Subscrição aprovada com sucesso',
            'data' => $subscription->fresh(['user.roles', 'content.contentType', 'content.category', 'reviewer']),
        ]);
    }

    public function reject(Request $request, ContentSubscription $subscription): JsonResponse
    {
        $subscription->update([
            'status' => ContentSubscription::STATUS_REJECTED,
            'rejected_at' => now(),
            'approved_at' => null,
            'expires_at' => null,
            'reviewed_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Subscrição recusada com sucesso',
            'data' => $subscription->fresh(['user.roles', 'content.contentType', 'content.category', 'reviewer']),
        ]);
    }

    public function expire(Request $request, ContentSubscription $subscription): JsonResponse
    {
        $subscription->update([
            'status' => ContentSubscription::STATUS_EXPIRED,
            'expires_at' => now(),
            'reviewed_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Subscrição expirada com sucesso',
            'data' => $subscription->fresh(['user.roles', 'content.contentType', 'content.category', 'reviewer']),
        ]);
    }

    public function destroy(ContentSubscription $subscription): JsonResponse
    {
        $subscription->delete();

        return response()->json([
            'message' => 'Subscrição eliminada com sucesso',
        ]);
    }
}

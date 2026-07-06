<?php

namespace App\Services;

use App\DTOs\Forum\CreateForumDTO;
use App\DTOs\Forum\UpdateForumDTO;
use App\Models\Forum;
use App\Models\ForumMembership;
use App\Models\User;
use App\Repositories\ForumRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Collection as SupportCollection;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ForumService
{
    public function __construct(
        private ForumRepository $repository
    ) {}

    public function create(CreateForumDTO $dto): Forum
    {
        $forum = $this->repository->create([
            'user_id' => $dto->userId,
            'name' => $dto->name,
            'description' => $dto->description,
            'rules' => $dto->rules,
            'category' => $dto->category,
            'image_url' => $dto->imageUrl,
            'visibility' => $dto->visibility,
            'access_code' => $dto->visibility === 'private' ? ($dto->accessCode ?: $this->generateAccessCode()) : null,
            'join_approval_required' => $dto->visibility === 'private' ? $dto->joinApprovalRequired : false,
            'content_permission' => $dto->contentPermission,
            'allow_attachments' => $dto->allowAttachments,
            'artifacts' => $dto->artifacts,
            'status' => 'approved',
        ], $dto->contentIds);

        $forum->memberships()->updateOrCreate(
            ['user_id' => $dto->userId],
            ['status' => ForumMembership::STATUS_MEMBER, 'responded_at' => now()]
        );

        $this->inviteEmails($forum, $dto->userId, $dto->inviteEmails);

        return $this->decorateForum($forum->fresh(['user', 'reviewer', 'contents.category', 'contents.contentType', 'memberships']), User::query()->find($dto->userId));
    }

    public function getAll(array $filters = [], ?User $user = null)
    {
        return $this->decorateForums($this->repository->all($filters), $user);
    }

    public function getAllForModeration(array $filters = [])
    {
        return $this->repository->allForModeration($filters);
    }

    public function findById(int $id, bool $onlyApproved = true, ?User $user = null): ?Forum
    {
        $forum = $this->repository->findById($id, $onlyApproved);

        return $forum ? $this->decorateForum($forum, $user) : null;
    }

    public function requestJoin(int $id, User $user): Forum
    {
        $forum = $this->repository->findById($id);

        if (! $forum) {
            throw new NotFoundHttpException('Forum not found');
        }

        if ($forum->visibility !== 'private') {
            return $this->grantMembership($forum, $user);
        }

        $existing = $this->membershipForUser($forum, $user);

        if ($existing && $existing->status === ForumMembership::STATUS_INVITED) {
            return $this->grantMembership($forum, $user);
        }

        $forum->memberships()->updateOrCreate(
            ['user_id' => $user->id],
            ['email' => $user->email, 'status' => ForumMembership::STATUS_PENDING]
        );

        return $this->decorateForum($forum->fresh(['user', 'reviewer', 'contents.category', 'contents.contentType', 'memberships']), $user);
    }

    public function acceptInvitation(int $id, User $user): Forum
    {
        $forum = $this->repository->findById($id);

        if (! $forum) {
            throw new NotFoundHttpException('Forum not found');
        }

        $membership = $this->membershipForUser($forum, $user);

        if (! $membership || $membership->status !== ForumMembership::STATUS_INVITED) {
            throw new AccessDeniedHttpException('No forum invitation found');
        }

        return $this->grantMembership($forum, $user);
    }

    public function invite(int $id, User $user, array $emails): Forum
    {
        $forum = $this->repository->findById($id);

        if (! $forum) {
            throw new NotFoundHttpException('Forum not found');
        }

        if ((int) $forum->user_id !== (int) $user->id && ! $user->isAdminOrSuperAdmin()) {
            throw new AccessDeniedHttpException('You cannot invite users to this forum');
        }

        $this->inviteEmails($forum, $user->id, $emails);

        return $this->decorateForum($forum->fresh(['user', 'reviewer', 'contents.category', 'contents.contentType', 'memberships']), $user);
    }

    public function pendingMemberships(int $id, User $user): SupportCollection
    {
        $forum = $this->repository->findById($id);

        if (! $forum) {
            throw new NotFoundHttpException('Forum not found');
        }

        $this->authorizeManageMemberships($forum, $user);

        return $forum->memberships()
            ->with('user')
            ->where('status', ForumMembership::STATUS_PENDING)
            ->latest()
            ->get();
    }

    public function approveMembership(int $id, int $membershipId, User $user): ForumMembership
    {
        $forum = $this->repository->findById($id);

        if (! $forum) {
            throw new NotFoundHttpException('Forum not found');
        }

        $this->authorizeManageMemberships($forum, $user);

        $membership = $forum->memberships()
            ->whereKey($membershipId)
            ->first();

        if (! $membership) {
            throw new NotFoundHttpException('Forum membership not found');
        }

        $membership->update([
            'status' => ForumMembership::STATUS_MEMBER,
            'responded_at' => now(),
        ]);

        return $membership->fresh(['user']);
    }

    public function rejectMembership(int $id, int $membershipId, User $user): ForumMembership
    {
        $forum = $this->repository->findById($id);

        if (! $forum) {
            throw new NotFoundHttpException('Forum not found');
        }

        $this->authorizeManageMemberships($forum, $user);

        $membership = $forum->memberships()
            ->whereKey($membershipId)
            ->first();

        if (! $membership) {
            throw new NotFoundHttpException('Forum membership not found');
        }

        $membership->update([
            'status' => ForumMembership::STATUS_REJECTED,
            'responded_at' => now(),
        ]);

        return $membership->fresh(['user']);
    }

    public function canViewForum(Forum $forum, ?User $user): bool
    {
        if ($forum->visibility !== 'private') {
            return true;
        }

        if (! $user) {
            return false;
        }

        return $this->accessStatus($forum, $user) === ForumMembership::STATUS_MEMBER;
    }

    public function update(int $id, UpdateForumDTO $dto): ?Forum
    {
        $forum = $this->repository->findById($id, false);

        if (! $forum) {
            return null;
        }

        return $this->repository->update($forum, $dto->toArray());
    }

    public function delete(int $id): bool
    {
        $forum = $this->repository->findById($id, false);

        if (! $forum) {
            return false;
        }

        return $this->repository->delete($forum);
    }

    public function approve(int $id, int $reviewerId): ?Forum
    {
        $forum = $this->repository->findById($id, false);

        if (! $forum) {
            return null;
        }

        return $this->repository->updateStatus($forum, 'approved', $reviewerId);
    }

    public function reject(int $id, int $reviewerId): ?Forum
    {
        $forum = $this->repository->findById($id, false);

        if (! $forum) {
            return null;
        }

        return $this->repository->updateStatus($forum, 'rejected', $reviewerId);
    }

    private function generateAccessCode(): string
    {
        return 'EH-'.strtoupper(substr(bin2hex(random_bytes(4)), 0, 8));
    }

    private function inviteEmails(Forum $forum, int $inviterId, array $emails): void
    {
        collect($emails)
            ->map(fn (string $email): string => strtolower(trim($email)))
            ->filter()
            ->unique()
            ->each(function (string $email) use ($forum, $inviterId): void {
                $user = User::query()->where('email', $email)->first();

                $forum->memberships()->updateOrCreate(
                    $user ? ['user_id' => $user->id] : ['email' => $email],
                    [
                        'email' => $email,
                        'status' => ForumMembership::STATUS_INVITED,
                        'invited_by' => $inviterId,
                    ]
                );
            });
    }

    private function authorizeManageMemberships(Forum $forum, User $user): void
    {
        if ((int) $forum->user_id === (int) $user->id || $user->isAdminOrSuperAdmin()) {
            return;
        }

        throw new AccessDeniedHttpException('You cannot manage forum membership requests');
    }

    private function grantMembership(Forum $forum, User $user): Forum
    {
        $existing = $this->membershipForUser($forum, $user);

        if ($existing) {
            $existing->update([
                'user_id' => $user->id,
                'email' => $user->email,
                'status' => ForumMembership::STATUS_MEMBER,
                'responded_at' => now(),
            ]);
        } else {
            $forum->memberships()->create([
                'user_id' => $user->id,
                'email' => $user->email,
                'status' => ForumMembership::STATUS_MEMBER,
                'responded_at' => now(),
            ]);
        }

        return $this->decorateForum($forum->fresh(['user', 'reviewer', 'contents.category', 'contents.contentType', 'memberships']), $user);
    }

    private function decorateForums(Collection $forums, ?User $user): Collection
    {
        return $forums->map(fn (Forum $forum): Forum => $this->decorateForum($forum, $user));
    }

    private function decorateForum(Forum $forum, ?User $user): Forum
    {
        $forum->loadMissing('memberships');
        $status = $user ? $this->accessStatus($forum, $user) : 'none';
        $canView = $forum->visibility !== 'private'
            || $status === ForumMembership::STATUS_MEMBER
            || ($user && (int) $forum->user_id === (int) $user->id)
            || ($user && $user->isAdminOrSuperAdmin());

        $forum->setAttribute('members_count', $forum->memberships->where('status', ForumMembership::STATUS_MEMBER)->count());
        $forum->setAttribute('access_status', $canView ? ForumMembership::STATUS_MEMBER : $status);
        $forum->setAttribute('can_view', $canView);
        $forum->setAttribute('invite_emails', $forum->memberships->where('status', ForumMembership::STATUS_INVITED)->pluck('email')->filter()->values());

        if (! $canView && $forum->visibility === 'private') {
            $forum->unsetRelation('topics');
        }

        return $forum;
    }

    private function accessStatus(Forum $forum, User $user): string
    {
        if ((int) $forum->user_id === (int) $user->id || $user->isAdminOrSuperAdmin()) {
            return ForumMembership::STATUS_MEMBER;
        }

        return $this->membershipForUser($forum, $user)?->status ?? 'none';
    }

    private function membershipForUser(Forum $forum, User $user): ?ForumMembership
    {
        $forum->loadMissing('memberships');

        return $forum->memberships
            ->first(fn (ForumMembership $membership): bool =>
                (int) ($membership->user_id ?? 0) === (int) $user->id
                || ($membership->email && strtolower($membership->email) === strtolower($user->email))
            );
    }
}

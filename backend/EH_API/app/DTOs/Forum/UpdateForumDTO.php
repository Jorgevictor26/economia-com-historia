<?php

namespace App\DTOs\Forum;

readonly class UpdateForumDTO
{
    public function __construct(
        public ?string $name = null,
        public ?string $description = null,
        public ?string $rules = null,
        public ?string $category = null,
        public ?string $visibility = null,
        public ?string $accessCode = null,
        public ?bool $joinApprovalRequired = null,
        public ?string $contentPermission = null,
        public ?array $artifacts = null,
        public bool $hasName = false,
        public bool $hasDescription = false,
        public bool $hasRules = false,
        public bool $hasCategory = false,
        public bool $hasVisibility = false,
        public bool $hasAccessCode = false,
        public bool $hasJoinApprovalRequired = false,
        public bool $hasContentPermission = false,
        public bool $hasArtifacts = false
    ) {}

    public function toArray(): array
    {
        $data = [];

        if ($this->hasName) {
            $data['name'] = $this->name;
        }

        if ($this->hasDescription) {
            $data['description'] = $this->description;
        }

        if ($this->hasRules) {
            $data['rules'] = $this->rules;
        }

        if ($this->hasCategory) {
            $data['category'] = $this->category;
        }

        if ($this->hasVisibility) {
            $data['visibility'] = $this->visibility;
            if ($this->visibility === 'public') {
                $data['access_code'] = null;
                $data['join_approval_required'] = false;
            }
        }

        if ($this->hasAccessCode && $this->visibility !== 'public') {
            $data['access_code'] = $this->accessCode;
        }

        if ($this->hasJoinApprovalRequired && $this->visibility !== 'public') {
            $data['join_approval_required'] = (bool) $this->joinApprovalRequired;
        }

        if ($this->hasContentPermission) {
            $data['content_permission'] = $this->contentPermission;
        }

        if ($this->hasArtifacts) {
            $data['artifacts'] = $this->artifacts;
            $data['allow_attachments'] = ! empty($this->artifacts);
        }

        return $data;
    }
}

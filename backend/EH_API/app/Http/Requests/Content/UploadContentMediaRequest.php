<?php

namespace App\Http\Requests\Content;

use App\Support\ContentMedia;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Validation\Rule;

class UploadContentMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $mediaType = $this->validatedMediaType();
        $mediaRules = ContentMedia::validationRulesFor($mediaType);

        return [
            'media_type' => ['sometimes', 'string', Rule::in(ContentMedia::TYPES)],
            'file' => ['required_without:'.$mediaType, ...$mediaRules],
            $mediaType => ['required_without:file', ...$mediaRules],
        ];
    }

    public function mediaType(): string
    {
        return (string) ($this->route('mediaType') ?? $this->input('media_type'));
    }

    public function mediaFile(): UploadedFile
    {
        return $this->file('file') ?? $this->file($this->validatedMediaType());
    }

    private function validatedMediaType(): string
    {
        $mediaType = $this->mediaType();

        return in_array($mediaType, ContentMedia::TYPES, true) ? $mediaType : 'image';
    }
}

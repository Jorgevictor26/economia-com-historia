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
            'file' => ['required', ...$mediaRules],
        ];
    }

    public function mediaType(): string
    {
        return (string) ($this->route('mediaType') ?? $this->input('media_type'));
    }

    public function mediaFile(): UploadedFile
    {
        return $this->file('file');
    }

    public function messages(): array
    {
        return [
            'file.uploaded' => 'O ficheiro nao foi enviado. Confirme upload_max_filesize e post_max_size no PHP.',
            'file.max' => 'O ficheiro excede o tamanho maximo permitido para este tipo de media.',
            'file.mimes' => 'O formato do ficheiro nao e suportado para este tipo de media.',
        ];
    }

    private function validatedMediaType(): string
    {
        $mediaType = $this->mediaType();

        return in_array($mediaType, ContentMedia::TYPES, true) ? $mediaType : 'image';
    }
}

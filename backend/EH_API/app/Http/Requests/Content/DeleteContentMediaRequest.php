<?php

namespace App\Http\Requests\Content;

use App\Support\ContentMedia;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DeleteContentMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'media_type' => ['required', 'string', Rule::in(ContentMedia::TYPES)],
        ];
    }
}

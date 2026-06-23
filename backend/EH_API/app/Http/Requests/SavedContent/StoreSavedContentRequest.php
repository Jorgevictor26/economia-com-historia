<?php

namespace App\Http\Requests\SavedContent;

use Illuminate\Foundation\Http\FormRequest;

class StoreSavedContentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content_id' => ['required', 'integer', 'exists:contents,id'],
        ];
    }
}

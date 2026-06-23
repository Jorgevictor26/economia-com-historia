<?php

namespace App\Http\Requests\SavedContent;

use Illuminate\Foundation\Http\FormRequest;

class DestroySavedContentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'contentId' => ['required', 'integer', 'exists:contents,id'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'contentId' => $this->route('contentId'),
        ]);
    }
}

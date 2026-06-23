<?php

namespace App\Http\Requests\Content;

use Illuminate\Foundation\Http\FormRequest;

class DeleteContentMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'media_type' => ['required', 'string', 'in:image,video,audio,document'],
        ];
    }
}

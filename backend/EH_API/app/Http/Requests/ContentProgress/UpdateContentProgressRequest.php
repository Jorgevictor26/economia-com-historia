<?php

namespace App\Http\Requests\ContentProgress;

use Illuminate\Foundation\Http\FormRequest;

class UpdateContentProgressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'progress_percent' => ['required', 'integer', 'min:0', 'max:100'],
            'last_position_seconds' => ['nullable', 'integer', 'min:0'],
        ];
    }
}

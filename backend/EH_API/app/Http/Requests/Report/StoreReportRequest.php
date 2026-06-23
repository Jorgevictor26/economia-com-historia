<?php

namespace App\Http\Requests\Report;

use Illuminate\Foundation\Http\FormRequest;

class StoreReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content_id' => ['required', 'integer', 'exists:contents,id'],
            'reason' => ['required', 'string', 'in:spam,offensive_content,fake_information,copyright,other'],
            'description' => ['nullable', 'string', 'max:2000'],
        ];
    }
}

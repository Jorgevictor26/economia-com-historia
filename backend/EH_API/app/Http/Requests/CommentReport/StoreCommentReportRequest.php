<?php

namespace App\Http\Requests\CommentReport;

use Illuminate\Foundation\Http\FormRequest;

class StoreCommentReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'comment_id' => ['required', 'integer', 'exists:comments,id'],
            'reason' => ['required', 'string', 'in:spam,offensive_comment,fake_information,copyright,other'],
            'description' => ['nullable', 'string', 'max:2000'],
        ];
    }
}

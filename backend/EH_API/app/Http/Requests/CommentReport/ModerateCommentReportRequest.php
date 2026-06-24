<?php

namespace App\Http\Requests\CommentReport;

use Illuminate\Foundation\Http\FormRequest;

class ModerateCommentReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [];
    }
}

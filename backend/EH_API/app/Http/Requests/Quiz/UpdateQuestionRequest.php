<?php

namespace App\Http\Requests\Quiz;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'question' => ['sometimes', 'required', 'string'],
            'order' => ['sometimes', 'required', 'integer', 'min:1'],
            'alternatives' => ['sometimes', 'required', 'array', 'min:2'],
            'alternatives.*.text' => ['required_with:alternatives', 'string', 'max:255'],
            'alternatives.*.is_correct' => ['required_with:alternatives', 'boolean'],
            'difficulty' => ['prohibited'],
            'time' => ['prohibited'],
            'time_seconds' => ['prohibited'],
            'score' => ['prohibited'],
            'points' => ['prohibited'],
            'xp' => ['prohibited'],
            'option_a' => ['prohibited'],
            'option_b' => ['prohibited'],
            'option_c' => ['prohibited'],
            'option_d' => ['prohibited'],
            'correct_option' => ['prohibited'],
            'explanation' => ['nullable', 'string'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $alternatives = collect($this->input('alternatives', []))
            ->map(function (array $alternative): array {
                if (array_key_exists('correta', $alternative) && ! array_key_exists('is_correct', $alternative)) {
                    $alternative['is_correct'] = $alternative['correta'];
                }

                return $alternative;
            })
            ->values()
            ->all();

        if ($alternatives !== []) {
            $this->merge(['alternatives' => $alternatives]);
        }
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if (! $this->has('alternatives')) {
                    return;
                }

                $correctCount = collect($this->input('alternatives', []))
                    ->filter(fn (array $alternative): bool => filter_var($alternative['is_correct'] ?? false, FILTER_VALIDATE_BOOL))
                    ->count();

                if ($correctCount !== 1) {
                    $validator->errors()->add('alternatives', 'A pergunta deve ter exatamente uma alternativa correta.');
                }
            },
        ];
    }
}

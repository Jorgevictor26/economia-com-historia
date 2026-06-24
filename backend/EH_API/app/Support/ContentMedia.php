<?php

namespace App\Support;

final class ContentMedia
{
    public const TYPES = ['image', 'video', 'audio', 'document'];

    public const COLUMNS = [
        'image' => 'image_url',
        'video' => 'video_url',
        'audio' => 'audio_url',
        'document' => 'document_url',
    ];

    public const VALIDATION_RULES = [
        'image' => ['file', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        'video' => ['file', 'mimes:mp4,mov', 'max:102400'],
        'audio' => ['file', 'mimes:mp3,wav', 'max:20480'],
        'document' => ['file', 'mimes:pdf', 'max:20480'],
    ];

    public static function columnFor(string $type): string
    {
        return self::COLUMNS[$type];
    }

    public static function validationRulesFor(string $type): array
    {
        return self::VALIDATION_RULES[$type];
    }
}

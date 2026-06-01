<?php

namespace Database\Seeders;

use App\Models\ContentType;
use Illuminate\Database\Seeder;

class ContentTypeSeeder extends Seeder
{
    public function run(): void
    {
        $contentTypes = [
            [
                'name' => 'Texto',
                'slug' => 'texto',
                'description' => 'Artigos, leituras e materiais escritos.',
            ],
            [
                'name' => 'Video',
                'slug' => 'video',
                'description' => 'Conteudos em formato audiovisual.',
            ],
            [
                'name' => 'Jindungo',
                'slug' => 'jindungo',
                'description' => 'Conteudos especiais com analise aprofundada.',
            ],
        ];

        foreach ($contentTypes as $contentType) {
            ContentType::updateOrCreate(
                ['slug' => $contentType['slug']],
                $contentType
            );
        }
    }
}

<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Economia',
                'description' => 'Temas economicos, mercados, moeda, comercio e desenvolvimento.',
            ],
            [
                'name' => 'Historia',
                'description' => 'Contextos historicos, memoria social e processos politicos.',
            ],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['name' => $category['name']],
                $category
            );
        }
    }
}

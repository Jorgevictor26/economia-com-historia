<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            [
                'name' => 'user',
                'description' => 'Utilizador normal que pode visualizar conteúdos e quizzes.',
            ],
            [
                'name' => 'writer',
                'description' => 'Utilizador que pode produzir conteúdos editoriais.',
            ],
            [
                'name' => 'admin',
                'description' => 'Administrador da plataforma.',
            ],
            [
                'name' => 'super-admin',
                'description' => 'Administrador com permissões totais.',
            ],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(
                ['name' => $role['name']],
                $role
            );
        }
    }
}

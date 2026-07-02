<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => 'Super Administrador',
                'email' => 'c',
                'password' => 'SuperAdmin123!',
                'role' => 'super-admin',
            ],
            [
                'name' => 'Administrador',
                'email' => 'admin@economiahistoria.ao',
                'password' => 'Admin123!',
                'role' => 'admin',
            ],
            [
                'name' => 'Escritor',
                'email' => 'writer@economiahistoria.ao',
                'password' => 'Writer123!',
                'role' => 'writer',
            ],
        ];

        foreach ($users as $seedUser) {
            $role = Role::where('name', $seedUser['role'])->firstOrFail();

            $user = User::updateOrCreate(
                ['email' => $seedUser['email']],
                [
                    'name' => $seedUser['name'],
                    'password' => Hash::make($seedUser['password']),
                    'status' => 'active',
                ]
            );

            $user->roles()->syncWithoutDetaching([
                $role->id => ['created_at' => now()],
            ]);
        }
    }
}

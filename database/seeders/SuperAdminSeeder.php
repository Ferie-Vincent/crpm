<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        // Créer le rôle s'il n'existe pas encore
        Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'web']);

        // Créer ou récupérer le super admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@bdp.local'],
            [
                'name'     => 'Super Admin',
                'password' => Hash::make('password'),
                'pays_id'  => null,
            ]
        );

        // S'assurer qu'il a bien le rôle super_admin
        if (! $admin->hasRole('super_admin')) {
            $admin->assignRole('super_admin');
        }

        $this->command->info('Super Admin créé : admin@bdp.local / password');
    }
}

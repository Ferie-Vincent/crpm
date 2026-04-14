<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Pays;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. Rôles ─────────────────────────────────────────────────────────
        foreach (['super_admin', 'gestionnaire', 'auditeur', 'agent_terrain', 'admin_organisation'] as $role) {
            Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
        }

        // ── 2. Pays ───────────────────────────────────────────────────────────
        $this->call(PaysSeeder::class);

        $senegal = Pays::where('code', 'SEN')->first();

        // ── 3. Utilisateurs (AVANT les seeders pays qui en ont besoin) ────────
        $admin = User::firstOrCreate(
            ['email' => 'admin@bdp.local'],
            ['name' => 'Super Admin', 'password' => Hash::make('password'), 'pays_id' => null]
        );
        $admin->update(['pays_id' => null]);
        $admin->assignRole('super_admin');

        User::firstOrCreate(
            ['email' => 'guillaume@bdp.local'],
            ['name' => 'Guillaume Gestionnaire', 'password' => Hash::make('password'), 'pays_id' => $senegal?->id]
        )->assignRole('gestionnaire');

        User::firstOrCreate(
            ['email' => 'alice@bdp.local'],
            ['name' => 'Alice Auditrice', 'password' => Hash::make('password'), 'pays_id' => $senegal?->id]
        )->assignRole('auditeur');

        User::firstOrCreate(
            ['email' => 'amadou@bdp.local'],
            ['name' => 'Amadou Agent', 'password' => Hash::make('password'), 'pays_id' => $senegal?->id]
        )->assignRole('agent_terrain');

        // ── 4. Données par pays (SEN, CIV, GIN, CMR) ─────────────────────────
        $this->call([
            FsdCasamanceSeeder::class,
            CoteDIvoireSeeder::class,
            GuineeSeeder::class,
            CamerounSeeder::class,
            MadagascarSeeder::class,
            ComoresSeeder::class,
            CrpmSeeder::class,   // ← doit rester en dernier (réassigne tous les projets)
        ]);
    }
}

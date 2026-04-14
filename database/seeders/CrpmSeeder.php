<?php

namespace Database\Seeders;

use App\Models\Pays;
use App\Models\Programme;
use App\Models\Projet;
use Illuminate\Database\Seeder;

class CrpmSeeder extends Seeder
{
    public function run(): void
    {
        // ── Créer le programme régional CRPM ─────────────────────────────────
        $crpm = Programme::firstOrCreate(
            ['code' => 'CRPM'],
            [
                'pays_id'     => null,
                'nom'         => 'Coopération Régionale des Politiques Migratoires',
                'description' => 'Programme régional de coopération visant à accompagner les politiques migratoires en Afrique subsaharienne à travers le financement de microprojets économiques, sociaux et éducatifs.',
                'bailleur'    => 'Union Européenne / SCAC',
                'date_debut'  => '2020-01-01',
                'date_fin'    => '2025-12-31',
                'statut'      => 'actif',
            ]
        );

        // ── Rattacher les 6 pays au pivot programme_pays ─────────────────────
        $paysIds = Pays::whereIn('code', ['SEN', 'CIV', 'GIN', 'CMR', 'MDG', 'COM'])->pluck('id');
        $crpm->paysCibles()->sync($paysIds);

        // ── Rattacher tous les projets au CRPM ───────────────────────────────
        $count = Projet::count();
        Projet::query()->update(['programme_id' => $crpm->id]);

        $this->command->info("CRPM créé (id={$crpm->id}) · {$paysIds->count()} pays · {$count} projets rattachés.");
    }
}

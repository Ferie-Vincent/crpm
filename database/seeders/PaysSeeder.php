<?php

namespace Database\Seeders;

use App\Models\Pays;
use Illuminate\Database\Seeder;

class PaysSeeder extends Seeder
{
    public function run(): void
    {
        $pays = [
            // ── Afrique de l'Ouest ────────────────────────────────────────────
            ['code' => 'SEN', 'cca2' => 'sn', 'nom' => 'Sénégal',          'devise' => 'XOF', 'statut' => 'actif'],
            ['code' => 'CIV', 'cca2' => 'ci', 'nom' => "Côte d'Ivoire",    'devise' => 'XOF', 'statut' => 'actif'],
            ['code' => 'GIN', 'cca2' => 'gn', 'nom' => 'Guinée',            'devise' => 'GNF', 'statut' => 'actif'],

            // ── Afrique Centrale ─────────────────────────────────────────────
            ['code' => 'CMR', 'cca2' => 'cm', 'nom' => 'Cameroun',          'devise' => 'XAF', 'statut' => 'actif'],

            // ── Afrique de l'Est ─────────────────────────────────────────────
            ['code' => 'MDG', 'cca2' => 'mg', 'nom' => 'Madagascar',        'devise' => 'MGA', 'statut' => 'actif'],
            ['code' => 'COM', 'cca2' => 'km', 'nom' => 'Comores',           'devise' => 'KMF', 'statut' => 'actif'],

        ];

        foreach ($pays as $p) {
            $existing = Pays::where('code', $p['code'])->first();
            if ($existing) {
                $existing->update(['cca2' => $p['cca2']]);
            } else {
                Pays::create($p);
            }
        }

        $this->command->info(count($pays).' pays insérés (ou déjà présents).');
    }
}

<?php

namespace Database\Seeders;

use App\Models\Decaissement;
use App\Models\Pays;
use App\Models\Programme;
use App\Models\Projet;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ComoresSeeder extends Seeder
{
    public function run(): void
    {
        $com = Pays::where('code', 'COM')->firstOrFail();

        $gestionnaire = User::firstOrCreate(
            ['email' => 'gestionnaire.km@bdp.local'],
            [
                'name'     => 'Said Gestionnaire',
                'password' => Hash::make('password'),
                'pays_id'  => $com->id,
            ]
        );
        $gestionnaire->assignRole('gestionnaire');

        $programme = Programme::firstOrCreate(
            ['code' => 'FSD-KM-2014'],
            [
                'pays_id'     => $com->id,
                'nom'         => 'Fonds Social de Développement — Comores',
                'description' => 'Programme de soutien aux microprojets économiques et sociaux aux Comores.',
                'bailleur'    => 'SCAC Moroni',
                'date_debut'  => '2014-01-01',
                'date_fin'    => '2018-12-31',
                'statut'      => 'actif',
            ]
        );

        $projets = [
            [
                'code'            => 'FSD-KM-001',
                'titre'           => 'Pêche artisanale de Moroni — équipement et chambre froide communautaire',
                'porteur'         => 'COOP PECHE MORONI',
                'commune'         => 'Moroni',
                'region'          => 'Grande Comore',
                'domaine'         => 'Valorisation des Ressources Naturelles',
                'categorie'       => 'Economique',
                'montant_accorde' => 45000000,
                'montant_decaisse'=> 45000000,
                'statut'          => 'termine',
                'completude'      => 96,
                'eligible'        => true,
                'accord_scac'     => true,
                'decision'        => 'Validé',
                'evaluation'      => 'Très Bon',
                'decaissements'   => [
                    ['date' => '2014-06-01', 'montant' => 22000000, 'reference' => 'T1', 'objet' => 'Tranche 1'],
                    ['date' => '2015-01-10', 'montant' => 23000000, 'reference' => 'T2', 'objet' => 'Tranche 2 (solde)'],
                ],
            ],
            [
                'code'            => 'FSD-KM-002',
                'titre'           => 'Centre de santé de Mutsamudu — équipement pédiatrique',
                'porteur'         => 'ASSOC SANTE ANJOUAN',
                'commune'         => 'Mutsamudu',
                'region'          => 'Anjouan',
                'domaine'         => 'Santé',
                'categorie'       => 'Sociale',
                'montant_accorde' => 55000000,
                'montant_decaisse'=> 55000000,
                'statut'          => 'termine',
                'completude'      => 98,
                'eligible'        => true,
                'accord_scac'     => true,
                'decision'        => 'Validé',
                'evaluation'      => 'Excellent',
                'decaissements'   => [
                    ['date' => '2014-07-01', 'montant' => 28000000, 'reference' => 'T1', 'objet' => 'Tranche 1'],
                    ['date' => '2015-02-01', 'montant' => 27000000, 'reference' => 'T2', 'objet' => 'Tranche 2 (solde)'],
                ],
            ],
            [
                'code'            => 'FSD-KM-003',
                'titre'           => 'Madrassa moderne de Fomboni — construction et équipement',
                'porteur'         => 'COMMUNE FOMBONI',
                'commune'         => 'Fomboni',
                'region'          => 'Mohéli',
                'domaine'         => 'Éducation',
                'categorie'       => 'Sociale',
                'montant_accorde' => 32000000,
                'montant_decaisse'=> 20000000,
                'statut'          => 'en_cours',
                'completude'      => 60,
                'eligible'        => true,
                'accord_scac'     => true,
                'decision'        => 'Validé avec modification',
                'evaluation'      => 'Bon',
                'decaissements'   => [
                    ['date' => '2015-04-01', 'montant' => 20000000, 'reference' => 'T1', 'objet' => 'Tranche 1'],
                ],
            ],
            [
                'code'            => 'FSD-KM-004',
                'titre'           => 'Écotourisme volcanique de Moroni — sentiers et guidage du Karthala',
                'porteur'         => 'ASSOC TOURISME NGAZIDJA',
                'commune'         => 'Moroni',
                'region'          => 'Grande Comore',
                'domaine'         => 'Tourisme Durable',
                'categorie'       => 'Economique',
                'montant_accorde' => 28000000,
                'montant_decaisse'=> 0,
                'statut'          => 'en_preparation',
                'completude'      => 20,
                'eligible'        => null,
                'accord_scac'     => false,
                'decision'        => null,
                'evaluation'      => null,
                'decaissements'   => [],
            ],
        ];

        $this->insertProjets($projets, $com, $programme, $gestionnaire);

        $this->command->info('Comores : ' . count($projets) . ' projets insérés.');
    }

    private function insertProjets(array $projets, $pays, $programme, $agent): void
    {
        foreach ($projets as $pd) {
            $meta = array_filter([
                'domaine'    => $pd['domaine'],
                'categorie'  => $pd['categorie'],
                'eligible'   => $pd['eligible'],
                'accord_scac'=> $pd['accord_scac'],
                'decision'   => $pd['decision'],
                'evaluation' => $pd['evaluation'],
            ], fn($v) => $v !== null);

            $projet = Projet::firstOrCreate(
                ['code' => $pd['code']],
                [
                    'pays_id'          => $pays->id,
                    'programme_id'     => $programme->id,
                    'titre'            => $pd['titre'],
                    'porteur'          => $pd['porteur'],
                    'commune'          => $pd['commune'],
                    'region'           => $pd['region'],
                    'montant_accorde'  => $pd['montant_accorde'],
                    'montant_decaisse' => $pd['montant_decaisse'],
                    'date_debut'       => $programme->date_debut,
                    'date_fin_prevue'  => $programme->date_fin,
                    'statut'           => $pd['statut'],
                    'completude'       => $pd['completude'],
                    'meta'             => $meta ?: null,
                ]
            );

            foreach ($pd['decaissements'] as $d) {
                Decaissement::firstOrCreate(
                    ['projet_id' => $projet->id, 'reference' => $d['reference']],
                    [
                        'created_by'        => $agent->id,
                        'date_decaissement' => $d['date'],
                        'montant'           => $d['montant'],
                        'objet'             => $d['objet'],
                        'statut'            => 'effectue',
                    ]
                );
            }
        }
    }
}

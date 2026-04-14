<?php

namespace Database\Seeders;

use App\Models\Decaissement;
use App\Models\Pays;
use App\Models\Programme;
use App\Models\Projet;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class GuineeSeeder extends Seeder
{
    public function run(): void
    {
        $gin = Pays::where('code', 'GIN')->firstOrFail();

        // Gestionnaire Guinée
        $gestionnaire = User::firstOrCreate(
            ['email' => 'gestionnaire.gn@bdp.local'],
            [
                'name'     => 'Mamadou Gestionnaire',
                'password' => Hash::make('password'),
                'pays_id'  => $gin->id,
            ]
        );
        $gestionnaire->assignRole('gestionnaire');

        // Programme
        $programme = Programme::firstOrCreate(
            ['code' => 'FSD-GN-2012'],
            [
                'pays_id'     => $gin->id,
                'nom'         => 'Fonds Social de Développement — Guinée',
                'description' => 'Programme de soutien aux microprojets économiques et sociaux en Guinée.',
                'bailleur'    => 'SCAC Conakry',
                'date_debut'  => '2012-01-01',
                'date_fin'    => '2016-12-31',
                'statut'      => 'actif',
            ]
        );

        $projets = [
            [
                'code'            => 'FSD-GN-001',
                'titre'           => 'Coopérative rizicole de Kindia — transformation et stockage',
                'porteur'         => 'COOP RIZICOLE KINDIA',
                'commune'         => 'Kindia',
                'region'          => 'Kindia',
                'domaine'         => 'Agriculture',
                'categorie'       => 'Economique',
                'montant_accorde' => 42000000,
                'montant_decaisse'=> 42000000,
                'statut'          => 'termine',
                'completude'      => 95,
                'eligible'        => true,
                'accord_scac'     => true,
                'decision'        => 'Validé',
                'evaluation'      => 'Très Bon',
                'decaissements'   => [
                    ['date' => '2012-05-01', 'montant' => 22000000, 'reference' => 'T1', 'objet' => 'Tranche 1'],
                    ['date' => '2013-01-10', 'montant' => 20000000, 'reference' => 'T2', 'objet' => 'Tranche 2 (solde)'],
                ],
            ],
            [
                'code'            => 'FSD-GN-002',
                'titre'           => 'Centre de santé communautaire de Labé — maternité et pédiatrie',
                'porteur'         => 'ASSOC SANTE LABE',
                'commune'         => 'Labé',
                'region'          => 'Labé',
                'domaine'         => 'Santé',
                'categorie'       => 'Sociale',
                'montant_accorde' => 55000000,
                'montant_decaisse'=> 55000000,
                'statut'          => 'termine',
                'completude'      => 98,
                'eligible'        => true,
                'accord_scac'     => true,
                'decision'        => 'Validé',
                'evaluation'      => 'Très Bon',
                'decaissements'   => [
                    ['date' => '2012-06-01', 'montant' => 25000000, 'reference' => 'T1', 'objet' => 'Tranche 1'],
                    ['date' => '2013-02-01', 'montant' => 18000000, 'reference' => 'T2', 'objet' => 'Tranche 2'],
                    ['date' => '2013-09-01', 'montant' => 12000000, 'reference' => 'T3', 'objet' => 'Tranche 3 (solde)'],
                ],
            ],
            [
                'code'            => 'FSD-GN-003',
                'titre'           => 'École primaire rurale de Kankan — construction et équipement',
                'porteur'         => 'COMMUNE KANKAN',
                'commune'         => 'Kankan',
                'region'          => 'Kankan',
                'domaine'         => 'Éducation',
                'categorie'       => 'Sociale',
                'montant_accorde' => 35000000,
                'montant_decaisse'=> 28000000,
                'statut'          => 'en_cours',
                'completude'      => 72,
                'eligible'        => true,
                'accord_scac'     => true,
                'decision'        => 'Validé avec modification',
                'evaluation'      => 'Bon',
                'decaissements'   => [
                    ['date' => '2013-03-01', 'montant' => 18000000, 'reference' => 'T1', 'objet' => 'Tranche 1'],
                    ['date' => '2013-10-01', 'montant' => 10000000, 'reference' => 'T2', 'objet' => 'Tranche 2'],
                ],
            ],
            [
                'code'            => 'FSD-GN-004',
                'titre'           => 'Valorisation de la bauxite artisanale de Boké — GIE minier local',
                'porteur'         => 'GIE MINIER BOKE',
                'commune'         => 'Boké',
                'region'          => 'Boké',
                'domaine'         => 'Valorisation des Ressources Naturelles',
                'categorie'       => 'Economique',
                'montant_accorde' => 60000000,
                'montant_decaisse'=> 25000000,
                'statut'          => 'suspendu',
                'completude'      => 40,
                'eligible'        => true,
                'accord_scac'     => true,
                'decision'        => 'Validé avec modification',
                'evaluation'      => 'Moyen',
                'decaissements'   => [
                    ['date' => '2014-01-01', 'montant' => 25000000, 'reference' => 'T1', 'objet' => 'Tranche 1'],
                ],
            ],
            [
                'code'            => 'FSD-GN-005',
                'titre'           => 'Maraîchage péri-urbain de Conakry — GIE des femmes de Ratoma',
                'porteur'         => 'GIE FEMMES RATOMA',
                'commune'         => 'Conakry',
                'region'          => 'Conakry',
                'domaine'         => 'Agriculture',
                'categorie'       => 'Sociale',
                'montant_accorde' => 18000000,
                'montant_decaisse'=> 0,
                'statut'          => 'en_preparation',
                'completude'      => 15,
                'eligible'        => null,
                'accord_scac'     => false,
                'decision'        => null,
                'evaluation'      => null,
                'decaissements'   => [],
            ],
        ];

        $this->insertProjets($projets, $gin, $programme, $gestionnaire);

        $this->command->info('Guinée : ' . count($projets) . ' projets insérés.');
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

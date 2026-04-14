<?php

namespace Database\Seeders;

use App\Models\Decaissement;
use App\Models\Pays;
use App\Models\Programme;
use App\Models\Projet;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class NigerSeeder extends Seeder
{
    public function run(): void
    {
        $ner = Pays::where('code', 'NER')->firstOrFail();

        // Gestionnaire Niger
        $gestionnaire = User::firstOrCreate(
            ['email' => 'gestionnaire.ne@bdp.local'],
            [
                'name'     => 'Issoufou Gestionnaire',
                'password' => Hash::make('password'),
                'pays_id'  => $ner->id,
            ]
        );
        $gestionnaire->assignRole('gestionnaire');

        // Programme
        $programme = Programme::firstOrCreate(
            ['code' => 'FSD-NE-2013'],
            [
                'pays_id'     => $ner->id,
                'nom'         => 'Fonds Social de Développement — Niger',
                'description' => 'Programme de soutien aux microprojets économiques et sociaux au Niger.',
                'bailleur'    => 'SCAC Niamey',
                'date_debut'  => '2013-01-01',
                'date_fin'    => '2017-12-31',
                'statut'      => 'actif',
            ]
        );

        $projets = [
            [
                'code'            => 'FSD-NE-001',
                'titre'           => 'Périmètre irrigué de Niamey — maraîchage communautaire',
                'porteur'         => 'COOP MARAICHERS NIAMEY',
                'commune'         => 'Niamey',
                'region'          => 'Niamey',
                'domaine'         => 'Agriculture',
                'categorie'       => 'Economique',
                'montant_accorde' => 36000000,
                'montant_decaisse'=> 36000000,
                'statut'          => 'termine',
                'completude'      => 92,
                'eligible'        => true,
                'accord_scac'     => true,
                'decision'        => 'Validé',
                'evaluation'      => 'Très Bon',
                'decaissements'   => [
                    ['date' => '2013-04-01', 'montant' => 20000000, 'reference' => 'T1', 'objet' => 'Tranche 1'],
                    ['date' => '2014-01-10', 'montant' => 16000000, 'reference' => 'T2', 'objet' => 'Tranche 2 (solde)'],
                ],
            ],
            [
                'code'            => 'FSD-NE-002',
                'titre'           => 'Dispensaire communautaire de Tahoua — accès aux soins primaires',
                'porteur'         => 'ASSOC SANTE TAHOUA',
                'commune'         => 'Tahoua',
                'region'          => 'Tahoua',
                'domaine'         => 'Santé',
                'categorie'       => 'Sociale',
                'montant_accorde' => 44000000,
                'montant_decaisse'=> 44000000,
                'statut'          => 'termine',
                'completude'      => 96,
                'eligible'        => true,
                'accord_scac'     => true,
                'decision'        => 'Validé',
                'evaluation'      => 'Très Bon',
                'decaissements'   => [
                    ['date' => '2013-06-01', 'montant' => 22000000, 'reference' => 'T1', 'objet' => 'Tranche 1'],
                    ['date' => '2014-02-01', 'montant' => 14000000, 'reference' => 'T2', 'objet' => 'Tranche 2'],
                    ['date' => '2014-08-01', 'montant' => 8000000,  'reference' => 'T3', 'objet' => 'Tranche 3 (solde)'],
                ],
            ],
            [
                'code'            => 'FSD-NE-003',
                'titre'           => 'École coranique modernisée de Zinder — classes bilingues',
                'porteur'         => 'ASSOC EDU ZINDER',
                'commune'         => 'Zinder',
                'region'          => 'Zinder',
                'domaine'         => 'Éducation',
                'categorie'       => 'Sociale',
                'montant_accorde' => 28000000,
                'montant_decaisse'=> 20000000,
                'statut'          => 'en_cours',
                'completude'      => 65,
                'eligible'        => true,
                'accord_scac'     => true,
                'decision'        => 'Validé avec modification',
                'evaluation'      => 'Bon',
                'decaissements'   => [
                    ['date' => '2014-03-01', 'montant' => 14000000, 'reference' => 'T1', 'objet' => 'Tranche 1'],
                    ['date' => '2014-11-01', 'montant' => 6000000,  'reference' => 'T2', 'objet' => 'Tranche 2'],
                ],
            ],
            [
                'code'            => 'FSD-NE-004',
                'titre'           => "Valorisation du sel d'Agadez — artisanat et commerce transfrontalier",
                'porteur'         => 'GIE SEL AGADEZ',
                'commune'         => 'Agadez',
                'region'          => 'Agadez',
                'domaine'         => 'Valorisation des Ressources Naturelles',
                'categorie'       => 'Economique',
                'montant_accorde' => 50000000,
                'montant_decaisse'=> 18000000,
                'statut'          => 'suspendu',
                'completude'      => 35,
                'eligible'        => true,
                'accord_scac'     => true,
                'decision'        => 'Validé avec modification',
                'evaluation'      => 'Moyen',
                'decaissements'   => [
                    ['date' => '2015-02-01', 'montant' => 18000000, 'reference' => 'T1', 'objet' => 'Tranche 1'],
                ],
            ],
            [
                'code'            => 'FSD-NE-005',
                'titre'           => 'Pastoralisme durable de Maradi — gestion des pâturages',
                'porteur'         => 'UNION ELEVEURS MARADI',
                'commune'         => 'Maradi',
                'region'          => 'Maradi',
                'domaine'         => 'Agriculture',
                'categorie'       => 'Mixte',
                'montant_accorde' => 22000000,
                'montant_decaisse'=> 0,
                'statut'          => 'en_preparation',
                'completude'      => 18,
                'eligible'        => null,
                'accord_scac'     => false,
                'decision'        => null,
                'evaluation'      => null,
                'decaissements'   => [],
            ],
        ];

        $this->insertProjets($projets, $ner, $programme, $gestionnaire);

        $this->command->info('Niger : ' . count($projets) . ' projets insérés.');
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

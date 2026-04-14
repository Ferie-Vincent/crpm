<?php

namespace Database\Seeders;

use App\Models\Decaissement;
use App\Models\Pays;
use App\Models\Programme;
use App\Models\Projet;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CoteDIvoireSeeder extends Seeder
{
    public function run(): void
    {
        $civ = Pays::where('code', 'CIV')->firstOrFail();

        // Gestionnaire Côte d'Ivoire
        $gestionnaire = User::firstOrCreate(
            ['email' => 'gestionnaire.ci@bdp.local'],
            [
                'name'     => 'Kouamé Gestionnaire',
                'password' => Hash::make('password'),
                'pays_id'  => $civ->id,
            ]
        );
        $gestionnaire->assignRole('gestionnaire');

        // Programme
        $programme = Programme::firstOrCreate(
            ['code' => 'FSD-CI-2010'],
            [
                'pays_id'     => $civ->id,
                'nom'         => "Fonds Social de Développement — Côte d'Ivoire",
                'description' => 'Programme de soutien aux microprojets économiques et sociaux en Côte d\'Ivoire.',
                'bailleur'    => 'SCAC Abidjan',
                'date_debut'  => '2010-01-01',
                'date_fin'    => '2014-12-31',
                'statut'      => 'actif',
            ]
        );

        $projets = [
            [
                'code'            => 'FSD-CI-001',
                'titre'           => 'Coopérative agricole de Bouaké — transformation du cajou',
                'porteur'         => 'COOPAB',
                'commune'         => 'Bouaké',
                'region'          => 'Vallée du Bandama',
                'domaine'         => 'Agriculture',
                'categorie'       => 'Economique',
                'montant_accorde' => 38500000,
                'montant_decaisse'=> 38500000,
                'statut'          => 'termine',
                'completude'      => 96,
                'eligible'        => true,
                'accord_scac'     => true,
                'decision'        => 'Validé',
                'evaluation'      => 'Très Bon',
                'decaissements'   => [
                    ['date' => '2010-06-01', 'montant' => 20000000, 'reference' => 'T1', 'objet' => 'Tranche 1'],
                    ['date' => '2011-01-15', 'montant' => 18500000, 'reference' => 'T2', 'objet' => 'Tranche 2 (solde)'],
                ],
            ],
            [
                'code'            => 'FSD-CI-002',
                'titre'           => "GIE Femmes d'Abidjan — maraîchage et vente directe",
                'porteur'         => 'GIE FEMA',
                'commune'         => 'Abidjan',
                'region'          => 'Lagunes',
                'domaine'         => 'Agriculture',
                'categorie'       => 'Sociale',
                'montant_accorde' => 12000000,
                'montant_decaisse'=> 12000000,
                'statut'          => 'termine',
                'completude'      => 88,
                'eligible'        => true,
                'accord_scac'     => true,
                'decision'        => 'Validé',
                'evaluation'      => 'Bon',
                'decaissements'   => [
                    ['date' => '2010-07-01', 'montant' => 7000000,  'reference' => 'T1', 'objet' => 'Tranche 1'],
                    ['date' => '2010-11-01', 'montant' => 5000000,  'reference' => 'T2', 'objet' => 'Tranche 2 (solde)'],
                ],
            ],
            [
                'code'            => 'FSD-CI-003',
                'titre'           => 'Centre artisanal de Man — vannerie et tissage traditionnel',
                'porteur'         => 'ARTISAN MAN',
                'commune'         => 'Man',
                'region'          => 'Montagnes',
                'domaine'         => 'Valorisation des Ressources Naturelles',
                'categorie'       => 'Economique',
                'montant_accorde' => 22000000,
                'montant_decaisse'=> 18000000,
                'statut'          => 'en_cours',
                'completude'      => 72,
                'eligible'        => true,
                'accord_scac'     => true,
                'decision'        => 'Validé avec modification',
                'evaluation'      => 'Bon',
                'decaissements'   => [
                    ['date' => '2011-03-01', 'montant' => 12000000, 'reference' => 'T1', 'objet' => 'Tranche 1'],
                    ['date' => '2011-09-15', 'montant' => 6000000,  'reference' => 'T2', 'objet' => 'Tranche 2'],
                ],
            ],
            [
                'code'            => 'FSD-CI-004',
                'titre'           => 'École de pêche artisanale de San-Pédro',
                'porteur'         => 'ASSOC PÊCHE SP',
                'commune'         => 'San-Pédro',
                'region'          => 'Bas-Sassandra',
                'domaine'         => 'Valorisation des Ressources Naturelles',
                'categorie'       => 'Sociale',
                'montant_accorde' => 45000000,
                'montant_decaisse'=> 45000000,
                'statut'          => 'termine',
                'completude'      => 94,
                'eligible'        => true,
                'accord_scac'     => true,
                'decision'        => 'Validé',
                'evaluation'      => 'Très Bon',
                'decaissements'   => [
                    ['date' => '2010-09-01', 'montant' => 20000000, 'reference' => 'T1', 'objet' => 'Tranche 1'],
                    ['date' => '2011-02-01', 'montant' => 15000000, 'reference' => 'T2', 'objet' => 'Tranche 2'],
                    ['date' => '2011-08-01', 'montant' => 10000000, 'reference' => 'T3', 'objet' => 'Tranche 3 (solde)'],
                ],
            ],
            [
                'code'            => 'FSD-CI-005',
                'titre'           => 'Tourisme communautaire de Yamoussoukro — circuit culturel',
                'porteur'         => 'TOURISME YAMK',
                'commune'         => 'Yamoussoukro',
                'region'          => 'Lacs',
                'domaine'         => 'Tourisme Durable',
                'categorie'       => 'Mixte',
                'montant_accorde' => 55000000,
                'montant_decaisse'=> 30000000,
                'statut'          => 'en_cours',
                'completude'      => 60,
                'eligible'        => false,
                'accord_scac'     => true,
                'decision'        => 'Validé avec modification',
                'evaluation'      => 'Bon',
                'decaissements'   => [
                    ['date' => '2012-01-01', 'montant' => 30000000, 'reference' => 'T1', 'objet' => 'Tranche 1'],
                ],
            ],
            [
                'code'            => 'FSD-CI-006',
                'titre'           => 'Élevage avicole de Korhogo — GIE des femmes du nord',
                'porteur'         => 'GIE AVICOLE KHG',
                'commune'         => 'Korhogo',
                'region'          => 'Poro',
                'domaine'         => 'Agriculture',
                'categorie'       => 'Economique',
                'montant_accorde' => 18000000,
                'montant_decaisse'=> 0,
                'statut'          => 'en_preparation',
                'completude'      => 25,
                'eligible'        => null,
                'accord_scac'     => false,
                'decision'        => null,
                'evaluation'      => null,
                'decaissements'   => [],
            ],
        ];

        $this->insertProjets($projets, $civ, $programme, $gestionnaire);

        $this->command->info("Côte d'Ivoire : " . count($projets) . ' projets insérés.');
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

<?php

namespace Database\Seeders;

use App\Models\Decaissement;
use App\Models\Pays;
use App\Models\Programme;
use App\Models\Projet;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class MadagascarSeeder extends Seeder
{
    public function run(): void
    {
        $mdg = Pays::where('code', 'MDG')->firstOrFail();

        $gestionnaire = User::firstOrCreate(
            ['email' => 'gestionnaire.mg@bdp.local'],
            [
                'name'     => 'Rakoto Gestionnaire',
                'password' => Hash::make('password'),
                'pays_id'  => $mdg->id,
            ]
        );
        $gestionnaire->assignRole('gestionnaire');

        $programme = Programme::firstOrCreate(
            ['code' => 'FSD-MG-2013'],
            [
                'pays_id'     => $mdg->id,
                'nom'         => 'Fonds Social de Développement — Madagascar',
                'description' => 'Programme de soutien aux microprojets économiques et sociaux à Madagascar.',
                'bailleur'    => 'SCAC Antananarivo',
                'date_debut'  => '2013-01-01',
                'date_fin'    => '2017-12-31',
                'statut'      => 'actif',
            ]
        );

        $projets = [
            [
                'code'            => 'FSD-MG-001',
                'titre'           => 'Riziculture irriguée des Hautes Terres — GIE paysans d\'Antsirabe',
                'porteur'         => 'GIE RIZICOLE ANTSIRABE',
                'commune'         => 'Antsirabe',
                'region'          => 'Vakinankaratra',
                'domaine'         => 'Agriculture',
                'categorie'       => 'Economique',
                'montant_accorde' => 48000000,
                'montant_decaisse'=> 48000000,
                'statut'          => 'termine',
                'completude'      => 97,
                'eligible'        => true,
                'accord_scac'     => true,
                'decision'        => 'Validé',
                'evaluation'      => 'Très Bon',
                'decaissements'   => [
                    ['date' => '2013-06-01', 'montant' => 24000000, 'reference' => 'T1', 'objet' => 'Tranche 1'],
                    ['date' => '2014-02-01', 'montant' => 24000000, 'reference' => 'T2', 'objet' => 'Tranche 2 (solde)'],
                ],
            ],
            [
                'code'            => 'FSD-MG-002',
                'titre'           => 'Centre de santé de base — maternité rurale de Fianarantsoa',
                'porteur'         => 'ASSOC SANTE FIANA',
                'commune'         => 'Fianarantsoa',
                'region'          => 'Haute Matsiatra',
                'domaine'         => 'Santé',
                'categorie'       => 'Sociale',
                'montant_accorde' => 62000000,
                'montant_decaisse'=> 62000000,
                'statut'          => 'termine',
                'completude'      => 99,
                'eligible'        => true,
                'accord_scac'     => true,
                'decision'        => 'Validé',
                'evaluation'      => 'Excellent',
                'decaissements'   => [
                    ['date' => '2013-07-01', 'montant' => 30000000, 'reference' => 'T1', 'objet' => 'Tranche 1'],
                    ['date' => '2014-01-15', 'montant' => 20000000, 'reference' => 'T2', 'objet' => 'Tranche 2'],
                    ['date' => '2014-08-01', 'montant' => 12000000, 'reference' => 'T3', 'objet' => 'Tranche 3 (solde)'],
                ],
            ],
            [
                'code'            => 'FSD-MG-003',
                'titre'           => 'École primaire publique de Mahajanga — construction salles de classe',
                'porteur'         => 'COMMUNE MAHAJANGA I',
                'commune'         => 'Mahajanga',
                'region'          => 'Boeny',
                'domaine'         => 'Éducation',
                'categorie'       => 'Sociale',
                'montant_accorde' => 38000000,
                'montant_decaisse'=> 30000000,
                'statut'          => 'en_cours',
                'completude'      => 75,
                'eligible'        => true,
                'accord_scac'     => true,
                'decision'        => 'Validé avec modification',
                'evaluation'      => 'Bon',
                'decaissements'   => [
                    ['date' => '2014-03-01', 'montant' => 18000000, 'reference' => 'T1', 'objet' => 'Tranche 1'],
                    ['date' => '2014-10-01', 'montant' => 12000000, 'reference' => 'T2', 'objet' => 'Tranche 2'],
                ],
            ],
            [
                'code'            => 'FSD-MG-004',
                'titre'           => 'Écotourisme côtier de Toliara — pirogue et guidage marin',
                'porteur'         => 'COOP TOURISME TOLIARA',
                'commune'         => 'Toliara',
                'region'          => 'Atsimo-Andrefana',
                'domaine'         => 'Tourisme Durable',
                'categorie'       => 'Economique',
                'montant_accorde' => 52000000,
                'montant_decaisse'=> 20000000,
                'statut'          => 'suspendu',
                'completude'      => 38,
                'eligible'        => true,
                'accord_scac'     => true,
                'decision'        => 'Validé',
                'evaluation'      => 'Moyen',
                'decaissements'   => [
                    ['date' => '2015-02-01', 'montant' => 20000000, 'reference' => 'T1', 'objet' => 'Tranche 1'],
                ],
            ],
            [
                'code'            => 'FSD-MG-005',
                'titre'           => 'Maraîchage péri-urbain d\'Antananarivo — GIE femmes de Betsimitatatra',
                'porteur'         => 'GIE FEMMES BETSI',
                'commune'         => 'Antananarivo',
                'region'          => 'Analamanga',
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

        $this->insertProjets($projets, $mdg, $programme, $gestionnaire);

        $this->command->info('Madagascar : ' . count($projets) . ' projets insérés.');
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

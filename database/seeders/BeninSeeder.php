<?php

namespace Database\Seeders;

use App\Models\Decaissement;
use App\Models\Pays;
use App\Models\Programme;
use App\Models\Projet;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class BeninSeeder extends Seeder
{
    public function run(): void
    {
        $ben = Pays::where('code', 'BEN')->firstOrFail();

        // Gestionnaire Bénin
        $gestionnaire = User::firstOrCreate(
            ['email' => 'gestionnaire.bj@bdp.local'],
            [
                'name'     => 'Félicien Gestionnaire',
                'password' => Hash::make('password'),
                'pays_id'  => $ben->id,
            ]
        );
        $gestionnaire->assignRole('gestionnaire');

        // Programme
        $programme = Programme::firstOrCreate(
            ['code' => 'FSD-BJ-2011'],
            [
                'pays_id'     => $ben->id,
                'nom'         => 'Fonds Social de Développement — Bénin',
                'description' => 'Programme de soutien aux microprojets économiques et sociaux au Bénin.',
                'bailleur'    => 'SCAC Cotonou',
                'date_debut'  => '2011-01-01',
                'date_fin'    => '2015-12-31',
                'statut'      => 'actif',
            ]
        );

        $projets = [
            [
                'code'            => 'FSD-BJ-001',
                'titre'           => 'Coopérative palmier à huile de Abomey — presse et commercialisation',
                'porteur'         => 'COOP PALMIER ABOMEY',
                'commune'         => 'Abomey',
                'region'          => 'Zou',
                'domaine'         => 'Agriculture',
                'categorie'       => 'Economique',
                'montant_accorde' => 40000000,
                'montant_decaisse'=> 40000000,
                'statut'          => 'termine',
                'completude'      => 94,
                'eligible'        => true,
                'accord_scac'     => true,
                'decision'        => 'Validé',
                'evaluation'      => 'Très Bon',
                'decaissements'   => [
                    ['date' => '2011-05-01', 'montant' => 22000000, 'reference' => 'T1', 'objet' => 'Tranche 1'],
                    ['date' => '2012-02-01', 'montant' => 18000000, 'reference' => 'T2', 'objet' => 'Tranche 2 (solde)'],
                ],
            ],
            [
                'code'            => 'FSD-BJ-002',
                'titre'           => 'Clinique maternelle de Porto-Novo — accouchements assistés',
                'porteur'         => 'ONG SANTE MERE PORTO',
                'commune'         => 'Porto-Novo',
                'region'          => 'Ouémé',
                'domaine'         => 'Santé',
                'categorie'       => 'Sociale',
                'montant_accorde' => 50000000,
                'montant_decaisse'=> 50000000,
                'statut'          => 'termine',
                'completude'      => 91,
                'eligible'        => true,
                'accord_scac'     => true,
                'decision'        => 'Validé',
                'evaluation'      => 'Très Bon',
                'decaissements'   => [
                    ['date' => '2011-07-01', 'montant' => 20000000, 'reference' => 'T1', 'objet' => 'Tranche 1'],
                    ['date' => '2012-03-01', 'montant' => 18000000, 'reference' => 'T2', 'objet' => 'Tranche 2'],
                    ['date' => '2012-09-01', 'montant' => 12000000, 'reference' => 'T3', 'objet' => 'Tranche 3 (solde)'],
                ],
            ],
            [
                'code'            => 'FSD-BJ-003',
                'titre'           => 'Centre de formation professionnelle de Parakou — menuiserie et couture',
                'porteur'         => 'ONG FORMATION PARAKOU',
                'commune'         => 'Parakou',
                'region'          => 'Borgou',
                'domaine'         => 'Éducation',
                'categorie'       => 'Sociale',
                'montant_accorde' => 32000000,
                'montant_decaisse'=> 24000000,
                'statut'          => 'en_cours',
                'completude'      => 70,
                'eligible'        => true,
                'accord_scac'     => true,
                'decision'        => 'Validé avec modification',
                'evaluation'      => 'Bon',
                'decaissements'   => [
                    ['date' => '2012-04-01', 'montant' => 16000000, 'reference' => 'T1', 'objet' => 'Tranche 1'],
                    ['date' => '2013-01-01', 'montant' => 8000000,  'reference' => 'T2', 'objet' => 'Tranche 2'],
                ],
            ],
            [
                'code'            => 'FSD-BJ-004',
                'titre'           => 'Tourisme historique de Natitingou — sites Tata Somba',
                'porteur'         => 'ASSOC TOURISME NATI',
                'commune'         => 'Natitingou',
                'region'          => 'Atacora',
                'domaine'         => 'Tourisme Durable',
                'categorie'       => 'Mixte',
                'montant_accorde' => 38000000,
                'montant_decaisse'=> 15000000,
                'statut'          => 'suspendu',
                'completude'      => 42,
                'eligible'        => true,
                'accord_scac'     => true,
                'decision'        => 'Validé avec modification',
                'evaluation'      => 'Moyen',
                'decaissements'   => [
                    ['date' => '2013-03-01', 'montant' => 15000000, 'reference' => 'T1', 'objet' => 'Tranche 1'],
                ],
            ],
            [
                'code'            => 'FSD-BJ-005',
                'titre'           => 'Marché de poissons de Cotonou — modernisation et chaîne du froid',
                'porteur'         => 'GIE PECHEURS COTONOU',
                'commune'         => 'Cotonou',
                'region'          => 'Littoral',
                'domaine'         => 'Valorisation des Ressources Naturelles',
                'categorie'       => 'Economique',
                'montant_accorde' => 28000000,
                'montant_decaisse'=> 0,
                'statut'          => 'en_preparation',
                'completude'      => 22,
                'eligible'        => null,
                'accord_scac'     => false,
                'decision'        => null,
                'evaluation'      => null,
                'decaissements'   => [],
            ],
        ];

        $this->insertProjets($projets, $ben, $programme, $gestionnaire);

        $this->command->info('Bénin : ' . count($projets) . ' projets insérés.');
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

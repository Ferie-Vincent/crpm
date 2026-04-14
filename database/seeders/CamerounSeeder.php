<?php

namespace Database\Seeders;

use App\Models\Decaissement;
use App\Models\Pays;
use App\Models\Programme;
use App\Models\Projet;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CamerounSeeder extends Seeder
{
    public function run(): void
    {
        $cmr = Pays::where('code', 'CMR')->firstOrFail();

        // Gestionnaire Cameroun
        $gestionnaire = User::firstOrCreate(
            ['email' => 'gestionnaire.cm@bdp.local'],
            [
                'name'     => 'Jean-Baptiste Gestionnaire',
                'password' => Hash::make('password'),
                'pays_id'  => $cmr->id,
            ]
        );
        $gestionnaire->assignRole('gestionnaire');

        // Programme
        $programme = Programme::firstOrCreate(
            ['code' => 'FSD-CM-2011'],
            [
                'pays_id'     => $cmr->id,
                'nom'         => 'Fonds Social de Développement — Cameroun',
                'description' => 'Programme de soutien aux microprojets économiques et sociaux au Cameroun.',
                'bailleur'    => 'SCAC Yaoundé',
                'date_debut'  => '2011-01-01',
                'date_fin'    => '2015-12-31',
                'statut'      => 'actif',
            ]
        );

        $projets = [
            [
                'code'            => 'FSD-CM-001',
                'titre'           => 'Filière cacao de Bafoussam — séchage et conditionnement',
                'porteur'         => 'COOP CACAO BAFOU',
                'commune'         => 'Bafoussam',
                'region'          => 'Ouest',
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
                    ['date' => '2011-04-01', 'montant' => 28000000, 'reference' => 'T1', 'objet' => 'Tranche 1'],
                    ['date' => '2012-01-15', 'montant' => 20000000, 'reference' => 'T2', 'objet' => 'Tranche 2 (solde)'],
                ],
            ],
            [
                'code'            => 'FSD-CM-002',
                'titre'           => 'Hôpital de district de Maroua — bloc opératoire et équipements',
                'porteur'         => 'DISTRICT SANTE MAROUA',
                'commune'         => 'Maroua',
                'region'          => 'Extrême-Nord',
                'domaine'         => 'Santé',
                'categorie'       => 'Sociale',
                'montant_accorde' => 60000000,
                'montant_decaisse'=> 60000000,
                'statut'          => 'termine',
                'completude'      => 93,
                'eligible'        => true,
                'accord_scac'     => true,
                'decision'        => 'Validé',
                'evaluation'      => 'Très Bon',
                'decaissements'   => [
                    ['date' => '2011-06-01', 'montant' => 25000000, 'reference' => 'T1', 'objet' => 'Tranche 1'],
                    ['date' => '2012-03-01', 'montant' => 20000000, 'reference' => 'T2', 'objet' => 'Tranche 2'],
                    ['date' => '2012-10-01', 'montant' => 15000000, 'reference' => 'T3', 'objet' => 'Tranche 3 (solde)'],
                ],
            ],
            [
                'code'            => 'FSD-CM-003',
                'titre'           => 'Lycée technique de Garoua — ateliers de formation professionnelle',
                'porteur'         => 'LYCEE TECH GAROUA',
                'commune'         => 'Garoua',
                'region'          => 'Nord',
                'domaine'         => 'Éducation',
                'categorie'       => 'Sociale',
                'montant_accorde' => 40000000,
                'montant_decaisse'=> 32000000,
                'statut'          => 'en_cours',
                'completude'      => 68,
                'eligible'        => true,
                'accord_scac'     => true,
                'decision'        => 'Validé avec modification',
                'evaluation'      => 'Bon',
                'decaissements'   => [
                    ['date' => '2012-05-01', 'montant' => 20000000, 'reference' => 'T1', 'objet' => 'Tranche 1'],
                    ['date' => '2013-01-01', 'montant' => 12000000, 'reference' => 'T2', 'objet' => 'Tranche 2'],
                ],
            ],
            [
                'code'            => 'FSD-CM-004',
                'titre'           => 'Port artisanal de Douala — pêche et conservation du poisson',
                'porteur'         => 'ASSOC PECHEURS DOUALA',
                'commune'         => 'Douala',
                'region'          => 'Littoral',
                'domaine'         => 'Valorisation des Ressources Naturelles',
                'categorie'       => 'Economique',
                'montant_accorde' => 52000000,
                'montant_decaisse'=> 20000000,
                'statut'          => 'suspendu',
                'completude'      => 38,
                'eligible'        => true,
                'accord_scac'     => true,
                'decision'        => 'Validé avec modification',
                'evaluation'      => 'Moyen',
                'decaissements'   => [
                    ['date' => '2013-02-01', 'montant' => 20000000, 'reference' => 'T1', 'objet' => 'Tranche 1'],
                ],
            ],
            [
                'code'            => 'FSD-CM-005',
                'titre'           => "Marché central de Yaoundé — réhabilitation et assainissement",
                'porteur'         => 'MAIRIE YAOUNDE',
                'commune'         => 'Yaoundé',
                'region'          => 'Centre',
                'domaine'         => 'Infrastructure',
                'categorie'       => 'Mixte',
                'montant_accorde' => 25000000,
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

        $this->insertProjets($projets, $cmr, $programme, $gestionnaire);

        $this->command->info('Cameroun : ' . count($projets) . ' projets insérés.');
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

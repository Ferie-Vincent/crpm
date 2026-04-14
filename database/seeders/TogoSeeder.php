<?php

namespace Database\Seeders;

use App\Models\Decaissement;
use App\Models\Pays;
use App\Models\Programme;
use App\Models\Projet;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TogoSeeder extends Seeder
{
    public function run(): void
    {
        $tgo = Pays::where('code', 'TGO')->firstOrFail();

        // Gestionnaire Togo
        $gestionnaire = User::firstOrCreate(
            ['email' => 'gestionnaire.tg@bdp.local'],
            [
                'name'     => 'Kofi Gestionnaire',
                'password' => Hash::make('password'),
                'pays_id'  => $tgo->id,
            ]
        );
        $gestionnaire->assignRole('gestionnaire');

        // Programme
        $programme = Programme::firstOrCreate(
            ['code' => 'FSD-TG-2012'],
            [
                'pays_id'     => $tgo->id,
                'nom'         => 'Fonds Social de Développement — Togo',
                'description' => 'Programme de soutien aux microprojets économiques et sociaux au Togo.',
                'bailleur'    => 'SCAC Lomé',
                'date_debut'  => '2012-01-01',
                'date_fin'    => '2016-12-31',
                'statut'      => 'actif',
            ]
        );

        $projets = [
            [
                'code'            => 'FSD-TG-001',
                'titre'           => 'Filière coton de Kara — égrenage et commercialisation',
                'porteur'         => 'COOP COTON KARA',
                'commune'         => 'Kara',
                'region'          => 'Kara',
                'domaine'         => 'Agriculture',
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
                    ['date' => '2012-04-01', 'montant' => 25000000, 'reference' => 'T1', 'objet' => 'Tranche 1'],
                    ['date' => '2013-01-01', 'montant' => 20000000, 'reference' => 'T2', 'objet' => 'Tranche 2 (solde)'],
                ],
            ],
            [
                'code'            => 'FSD-TG-002',
                'titre'           => 'Centre hospitalier régional de Sokodé — urgences et laboratoire',
                'porteur'         => 'CHR SOKODE',
                'commune'         => 'Sokodé',
                'region'          => 'Centrale',
                'domaine'         => 'Santé',
                'categorie'       => 'Sociale',
                'montant_accorde' => 58000000,
                'montant_decaisse'=> 58000000,
                'statut'          => 'termine',
                'completude'      => 98,
                'eligible'        => true,
                'accord_scac'     => true,
                'decision'        => 'Validé',
                'evaluation'      => 'Très Bon',
                'decaissements'   => [
                    ['date' => '2012-06-01', 'montant' => 24000000, 'reference' => 'T1', 'objet' => 'Tranche 1'],
                    ['date' => '2013-03-01', 'montant' => 20000000, 'reference' => 'T2', 'objet' => 'Tranche 2'],
                    ['date' => '2013-10-01', 'montant' => 14000000, 'reference' => 'T3', 'objet' => 'Tranche 3 (solde)'],
                ],
            ],
            [
                'code'            => 'FSD-TG-003',
                'titre'           => "Collège d'enseignement général d'Atakpamé — bibliothèque et informatique",
                'porteur'         => 'CEG ATAKPAME',
                'commune'         => 'Atakpamé',
                'region'          => 'Plateaux',
                'domaine'         => 'Éducation',
                'categorie'       => 'Sociale',
                'montant_accorde' => 30000000,
                'montant_decaisse'=> 22000000,
                'statut'          => 'en_cours',
                'completude'      => 75,
                'eligible'        => true,
                'accord_scac'     => true,
                'decision'        => 'Validé avec modification',
                'evaluation'      => 'Bon',
                'decaissements'   => [
                    ['date' => '2013-05-01', 'montant' => 15000000, 'reference' => 'T1', 'objet' => 'Tranche 1'],
                    ['date' => '2014-01-01', 'montant' => 7000000,  'reference' => 'T2', 'objet' => 'Tranche 2'],
                ],
            ],
            [
                'code'            => 'FSD-TG-004',
                'titre'           => "Exploitation du granite de Dapaong — artisanat et export",
                'porteur'         => 'GIE GRANITE DAPAONG',
                'commune'         => 'Dapaong',
                'region'          => 'Savanes',
                'domaine'         => 'Valorisation des Ressources Naturelles',
                'categorie'       => 'Economique',
                'montant_accorde' => 42000000,
                'montant_decaisse'=> 16000000,
                'statut'          => 'suspendu',
                'completude'      => 38,
                'eligible'        => true,
                'accord_scac'     => true,
                'decision'        => 'Validé avec modification',
                'evaluation'      => 'Moyen',
                'decaissements'   => [
                    ['date' => '2014-02-01', 'montant' => 16000000, 'reference' => 'T1', 'objet' => 'Tranche 1'],
                ],
            ],
            [
                'code'            => 'FSD-TG-005',
                'titre'           => 'Marché artisanal de Lomé — promotion des textiles traditionnels kente',
                'porteur'         => 'ASSOC ARTISANS LOME',
                'commune'         => 'Lomé',
                'region'          => 'Maritime',
                'domaine'         => 'Valorisation des Ressources Naturelles',
                'categorie'       => 'Mixte',
                'montant_accorde' => 20000000,
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

        $this->insertProjets($projets, $tgo, $programme, $gestionnaire);

        $this->command->info('Togo : ' . count($projets) . ' projets insérés.');
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

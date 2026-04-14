<?php

namespace Database\Seeders;

use App\Models\Decaissement;
use App\Models\MissionTerrain;
use App\Models\Pays;
use App\Models\Programme;
use App\Models\Projet;
use App\Models\User;
use Illuminate\Database\Seeder;

class FsdCasamanceSeeder extends Seeder
{
    public function run(): void
    {
        $senegal = Pays::where('code', 'SEN')->firstOrFail();
        $admin   = User::where('email', 'admin@bdp.local')->firstOrFail();
        $agent   = User::where('email', 'amadou@bdp.local')->firstOrFail();

        // ── Programme ────────────────────────────────────────────────────────
        $programme = Programme::firstOrCreate(
            ['code' => 'FSD-CAS-2008'],
            [
                'pays_id'     => $senegal->id,
                'nom'         => 'Fonds Social de Développement — Casamance',
                'description' => 'Programme de soutien aux microprojets économiques et sociaux en Casamance (Sénégal).',
                'bailleur'    => 'SCAC',
                'date_debut'  => '2008-01-01',
                'date_fin'    => '2010-12-31',
                'statut'      => 'actif',
            ]
        );

        // ── Projets (source : feuille Synthèse) ──────────────────────────────
        $projetsData = [
            [
                'num'             => 10,
                'code'            => 'FSD-ADY-010',
                'sigle'           => 'ADY',
                'titre'           => 'Association de Développement du Yamakeye',
                'porteur'         => 'ADY — Tenghory',
                'commune'         => 'Tenghory',
                'region'          => 'Ziguinchor',
                'domaine'         => 'Valorisation des Ressources Naturelles',
                'categorie'       => 'Economique',
                'montant_accorde' => 13140632,
                'montant_decaisse'=> 13140632,
                'statut'          => 'termine',
                'completude'      => 92,
                'decision'        => 'Validé avec modification',
                'accord_scac'     => true,
                'eligible'        => false,
                'evaluation'      => 'Bon',
            ],
            [
                'num'             => 37,
                'code'            => 'FSD-USOFORAL-037',
                'sigle'           => 'USOFORAL',
                'titre'           => 'Comité Régional de Solidarité des Femmes pour la Paix',
                'porteur'         => 'USOFORAL',
                'commune'         => 'Ziguinchor',
                'region'          => 'Ziguinchor',
                'domaine'         => 'Valorisation des Ressources Naturelles',
                'categorie'       => 'Economique',
                'montant_accorde' => 49924884,
                'montant_decaisse'=> 49924884,
                'statut'          => 'termine',
                'completude'      => 98,
                'decision'        => 'Validé avec modification',
                'accord_scac'     => true,
                'eligible'        => true,
                'evaluation'      => 'Très Bon',
            ],
            [
                'num'             => 38,
                'code'            => 'FSD-ADA-038',
                'sigle'           => 'GIE ADA',
                'titre'           => "Association du Développement d'Affiniam",
                'porteur'         => 'GIE ADA',
                'commune'         => 'Affiniam',
                'region'          => 'Ziguinchor',
                'domaine'         => 'Tourisme Durable',
                'categorie'       => 'Economique',
                'montant_accorde' => 29496824,
                'montant_decaisse'=> 26820500,
                'statut'          => 'en_cours',
                'completude'      => 88,
                'decision'        => 'Validé avec modification',
                'accord_scac'     => true,
                'eligible'        => false,
                'evaluation'      => 'Bon',
            ],
            [
                'num'             => 33,
                'code'            => 'FSD-JIRIBALUT-033',
                'sigle'           => 'GIE JIRIBALUT',
                'titre'           => 'GIE JIRIBALUT — Transformation de produits locaux',
                'porteur'         => 'GIE JIRIBALUT',
                'commune'         => 'Ziguinchor',
                'region'          => 'Ziguinchor',
                'domaine'         => 'Valorisation des Ressources Naturelles',
                'categorie'       => 'Economique',
                'montant_accorde' => 6200000,
                'montant_decaisse'=> 6200000,
                'statut'          => 'termine',
                'completude'      => 72,
                'decision'        => null,
                'accord_scac'     => true,
                'eligible'        => false,
                'evaluation'      => null,
            ],
            [
                'num'             => 35,
                'code'            => 'FSD-JIHITO-035',
                'sigle'           => 'GIE JIHITO',
                'titre'           => 'GIE JIHITO — Activités économiques communautaires',
                'porteur'         => 'GIE JIHITO',
                'commune'         => 'Ziguinchor',
                'region'          => 'Ziguinchor',
                'domaine'         => 'Valorisation des Ressources Naturelles',
                'categorie'       => 'Economique',
                'montant_accorde' => 6200000,
                'montant_decaisse'=> 6200000,
                'statut'          => 'termine',
                'completude'      => 80,
                'decision'        => 'Validé avec modification',
                'accord_scac'     => true,
                'eligible'        => true,
                'evaluation'      => 'Bon',
            ],
            [
                'num'             => 34,
                'code'            => 'FSD-UAMB-034',
                'sigle'           => 'GIE UAMB',
                'titre'           => 'Union des Apiculteurs de la Miellerie de Birassou',
                'porteur'         => 'GIE UAMB',
                'commune'         => 'Bignona',
                'region'          => 'Ziguinchor',
                'domaine'         => 'Valorisation des Ressources Naturelles',
                'categorie'       => 'Economique',
                'montant_accorde' => 25243500,
                'montant_decaisse'=> 25243500,
                'statut'          => 'termine',
                'completude'      => 90,
                'decision'        => 'Validé avec modification',
                'accord_scac'     => true,
                'eligible'        => true,
                'evaluation'      => 'Bon',
            ],
            [
                'num'             => 42,
                'code'            => 'FSD-OCEANIUM-042',
                'sigle'           => 'OCEANIUM',
                'titre'           => 'OCEANIUM — Tourisme durable en basse Casamance',
                'porteur'         => 'OCEANIUM',
                'commune'         => 'Basse Casamance',
                'region'          => 'Ziguinchor',
                'domaine'         => 'Tourisme Durable',
                'categorie'       => 'Economique',
                'montant_accorde' => 50000000,
                'montant_decaisse'=> 40000000,
                'statut'          => 'en_cours',
                'completude'      => 78,
                'decision'        => 'Validé avec modification',
                'accord_scac'     => true,
                'eligible'        => false,
                'evaluation'      => 'Bon',
            ],
            [
                'num'             => 39,
                'code'            => 'FSD-SITZ-039',
                'sigle'           => 'SITZ',
                'titre'           => "Syndicat d'Initiatives et de Tourisme de Ziguinchor",
                'porteur'         => 'SITZ',
                'commune'         => 'Ziguinchor',
                'region'          => 'Ziguinchor',
                'domaine'         => 'Tourisme Durable',
                'categorie'       => 'Sociale',
                'montant_accorde' => 42239295,
                'montant_decaisse'=> 25000000,
                'statut'          => 'en_cours',
                'completude'      => 65,
                'decision'        => 'Validé avec modification',
                'accord_scac'     => true,
                'eligible'        => true,
                'evaluation'      => 'Bon',
            ],
            [
                'num'             => 41,
                'code'            => 'FSD-CORECOU-041',
                'sigle'           => 'CORECOU',
                'titre'           => 'Comité de Rénovation de Coubalan',
                'porteur'         => 'CORECOU',
                'commune'         => 'Coubalan',
                'region'          => 'Ziguinchor',
                'domaine'         => 'Tourisme Durable',
                'categorie'       => 'Sociale',
                'montant_accorde' => 31000000,
                'montant_decaisse'=> 20000000,
                'statut'          => 'en_cours',
                'completude'      => 75,
                'decision'        => 'Validé avec modification',
                'accord_scac'     => true,
                'eligible'        => true,
                'evaluation'      => 'Bon',
            ],
            [
                'num'             => 36,
                'code'            => 'FSD-SAMATO-036',
                'sigle'           => 'GIE SAMATO',
                'titre'           => 'GIE SAMATO — Valorisation de ressources naturelles',
                'porteur'         => 'GIE SAMATO',
                'commune'         => 'Ziguinchor',
                'region'          => 'Ziguinchor',
                'domaine'         => 'Valorisation des Ressources Naturelles',
                'categorie'       => 'Economique',
                'montant_accorde' => 6200000,
                'montant_decaisse'=> 8000000,
                'statut'          => 'termine',
                'completude'      => 85,
                'decision'        => 'Validé avec modification',
                'accord_scac'     => true,
                'eligible'        => true,
                'evaluation'      => 'Bon',
            ],
            [
                'num'             => 8,
                'code'            => 'FSD-CRJ-008',
                'sigle'           => 'CRJ',
                'titre'           => 'Conseil Régional de la Jeunesse',
                'porteur'         => 'CRJ',
                'commune'         => null,
                'region'          => 'Ziguinchor',
                'domaine'         => null,
                'categorie'       => null,
                'montant_accorde' => 0,
                'montant_decaisse'=> 0,
                'statut'          => 'en_preparation',
                'completude'      => 20,
                'decision'        => null,
                'accord_scac'     => false,
                'eligible'        => false,
                'evaluation'      => null,
            ],
            [
                'num'             => 7,
                'code'            => 'FSD-ARA-007',
                'sigle'           => 'ARA',
                'titre'           => 'Association Régionale des Albinos',
                'porteur'         => 'ARA',
                'commune'         => null,
                'region'          => 'Ziguinchor',
                'domaine'         => null,
                'categorie'       => 'Sociale',
                'montant_accorde' => 0,
                'montant_decaisse'=> 0,
                'statut'          => 'suspendu',
                'completude'      => 30,
                'decision'        => 'Validé avec modification',
                'accord_scac'     => false,
                'eligible'        => true,
                'evaluation'      => 'Bon',
            ],
            [
                'num'             => 9,
                'code'            => 'FSD-TESSITO-009',
                'sigle'           => 'GIE TESSITO',
                'titre'           => 'GIE Tessito — Microprojet en attente',
                'porteur'         => 'GIE Tessito',
                'commune'         => null,
                'region'          => 'Ziguinchor',
                'domaine'         => null,
                'categorie'       => null,
                'montant_accorde' => 0,
                'montant_decaisse'=> 0,
                'statut'          => 'en_preparation',
                'completude'      => 15,
                'decision'        => null,
                'accord_scac'     => true,
                'eligible'        => false,
                'evaluation'      => null,
            ],
        ];

        // ── Décaissements (source : feuille Décaissement) ────────────────────
        $decaissementsData = [
            'FSD-ADY-010' => [
                ['date' => '2008-07-01', 'montant' => 7000000,  'reference' => 'T1', 'objet' => 'Tranche 1'],
                ['date' => '2008-10-01', 'montant' => 6140632,  'reference' => 'T2', 'objet' => 'Tranche 2 (solde)'],
            ],
            'FSD-USOFORAL-037' => [
                ['date' => '2008-07-15', 'montant' => 25000000, 'reference' => 'T1', 'objet' => 'Tranche 1'],
                ['date' => '2008-09-01', 'montant' => 15000000, 'reference' => 'T2', 'objet' => 'Tranche 2'],
                ['date' => '2009-01-15', 'montant' => 9924884,  'reference' => 'T3', 'objet' => 'Tranche 3 (solde)'],
            ],
            'FSD-ADA-038' => [
                ['date' => '2008-08-01', 'montant' => 10000000, 'reference' => 'T1', 'objet' => 'Tranche 1'],
                ['date' => '2008-10-01', 'montant' => 10000000, 'reference' => 'T2', 'objet' => 'Tranche 2'],
                ['date' => '2009-02-01', 'montant' => 6820500,  'reference' => 'T3', 'objet' => 'Tranche 3 (partielle)'],
            ],
            'FSD-JIRIBALUT-033' => [
                ['date' => '2008-07-01', 'montant' => 4000000, 'reference' => 'T1', 'objet' => 'Tranche 1'],
                ['date' => '2008-10-15', 'montant' => 2200000, 'reference' => 'T2', 'objet' => 'Tranche 2 (solde)'],
            ],
            'FSD-JIHITO-035' => [
                ['date' => '2008-07-01', 'montant' => 4000000, 'reference' => 'T1', 'objet' => 'Tranche 1'],
                ['date' => '2008-10-15', 'montant' => 2200000, 'reference' => 'T2', 'objet' => 'Tranche 2 (solde)'],
            ],
            'FSD-UAMB-034' => [
                ['date' => '2008-08-01', 'montant' => 10000000, 'reference' => 'T1', 'objet' => 'Tranche 1'],
                ['date' => '2008-10-03', 'montant' => 10000000, 'reference' => 'T2', 'objet' => 'Tranche 2'],
                ['date' => '2009-01-01', 'montant' => 5243500,  'reference' => 'T3', 'objet' => 'Tranche 3 (solde)'],
            ],
            'FSD-OCEANIUM-042' => [
                ['date' => '2008-09-01', 'montant' => 20000000, 'reference' => 'T1', 'objet' => 'Tranche 1'],
                ['date' => '2009-03-01', 'montant' => 20000000, 'reference' => 'T2', 'objet' => 'Tranche 2'],
            ],
            'FSD-SITZ-039' => [
                ['date' => '2008-09-15', 'montant' => 25000000, 'reference' => 'T1', 'objet' => 'Tranche 1'],
            ],
            'FSD-CORECOU-041' => [
                ['date' => '2008-10-01', 'montant' => 20000000, 'reference' => 'T1', 'objet' => 'Tranche 1'],
            ],
            'FSD-SAMATO-036' => [
                ['date' => '2008-07-07', 'montant' => 5000000, 'reference' => 'T1', 'objet' => 'Tranche 1'],
                ['date' => '2008-10-07', 'montant' => 3000000, 'reference' => 'T2', 'objet' => 'Tranche 2'],
            ],
        ];

        // ── Missions de suivi (source : feuille Missions de suivi) ───────────
        // Mapping N° bénéficiaire → code projet
        $numToCode = [
            35 => 'FSD-JIHITO-035',
            33 => 'FSD-JIRIBALUT-033',
            34 => 'FSD-UAMB-034',
            37 => 'FSD-USOFORAL-037',
            38 => 'FSD-ADA-038',
            36 => 'FSD-SAMATO-036',
        ];

        $missionsData = [
            ['ref' => 6,  'num' => 35, 'date' => '2008-02-09', 'cr' => "Première tranche de la subvention versée (seconde moitié août). Budget de 8,5 millions disponible. Erreurs d'appréciation technique : pompe de surface budgétée au lieu de pompe immergée — recherche d'autres fournisseurs en cours. Offre hors taxe de 9.161.250 FCFA identifiée."],
            ['ref' => 7,  'num' => 33, 'date' => '2008-04-09', 'cr' => "Première tranche reçue fin juillet. Enveloppe de 4.600.000 FCFA disponible. Modifications par rapport au projet initial : le GIE n'a pas trouvé de local à louer et s'est rabattu sur la réhabilitation d'un bâtiment cédé. Surcoût pris en charge directement."],
            ['ref' => 8,  'num' => 34, 'date' => '2008-05-09', 'cr' => "Subvention reçue début août. Disponible : 12.050.000 FCFA. Retrait de 9.959.500 FCFA du compte CNCA vers la mutuelle pour rapatrier les capitaux sur Kafountine. Achat de matériel informatique : 1.056.500 FCFA. Virement de 8.300.200 FCFA au GIE Diakomine pour fabrication du matériel."],
            ['ref' => 9,  'num' => 35, 'date' => '2008-08-09', 'cr' => "Subvention reçue le 04/08/08 — disponible : 4.600.000 FCFA. Achats : réhabilitation (dallage, carrelage, plafond, peinture), matériel de production (séchoir, balance, chariot, tabouret — commandé non réceptionné). Possibilité que le CCF prenne en charge la construction d'un bâtiment — à confirmer."],
            ['ref' => 10, 'num' => 37, 'date' => '2008-09-01', 'cr' => "USOFORAL dispose de 28.000.000 FCFA (première tranche + apport). Demande de terrain au CLD d'Enampore pour bâtiment de production de jus. Dossiers d'appel d'offres en cours de préparation. Réalisation des bâtiments à synchroniser avec la seconde tranche."],
            ['ref' => 11, 'num' => 38, 'date' => '2008-11-09', 'cr' => "Comité de pilotage non encore mis en place — à relancer. Budget disponible : 11.500.000 FCFA (première tranche + fonds propres). Dépenses déjà engagées : 2.454.400 FCFA (ciment, fer à béton, coquillages, sable)."],
            ['ref' => 14, 'num' => 38, 'date' => '2008-09-25', 'cr' => "Comité de pilotage constitué (5 personnes). Réunions hebdomadaires (jeudi) et mensuelles avec personnes ressources. Suivi des travaux restaurant : problème de sécurité soulevé. Décision d'arrondir la forme et laisser de grandes ouvertures."],
            ['ref' => 15, 'num' => 33, 'date' => '2008-09-29', 'cr' => "Chantier en cours mais avance lentement. Plafonds posés à refaire. GIE dispose de 5.868.605 FCFA de factures. Attente de 15 jours et avancement du chantier avant procédure de versement de la dernière tranche."],
            ['ref' => 16, 'num' => 34, 'date' => '2008-10-03', 'cr' => "Réalisations finalisées : 82 ruchettes, 120 ruches (85 restantes dans 15 jours), matériel informatique, 20 tenues de récolte, 20 grilles à reine. Justification : 9.243.000 FCFA sur 10.000.000 FSD + 1.056.500 FCFA apports. Demande de seconde tranche recevable. 27 personnes sur 41 ont cotisé."],
            ['ref' => 17, 'num' => 36, 'date' => '2008-07-09', 'cr' => "Fondations en cours mais stoppées en raison des pluies. Briques réalisées. Attente fin de semaine pour lancer la procédure de versement de la seconde tranche si visite de terrain positive."],
            ['ref' => 18, 'num' => 38, 'date' => '2008-10-07', 'cr' => "Comité de pilotage : 4 membres CA + président, 1 représentant ADA, 2 personnes du campement, Clara Bernard (Coopération française). Équipement des chambres : tailles et quantités déterminées. Répartition des tâches : sculpteur (décoration + jeux + portes), menuisier (lits doubles)."],
            ['ref' => 19, 'num' => 38, 'date' => '2008-10-08', 'cr' => "Extérieur : commandes en cours (tables, tabourets, plantations). Sanitaires : carrelage terminé. Cadres bois et moustiquaires prévus pour fenêtres. Portes en bois vernies (non peintes). Mur extérieur en tyrolienne."],
        ];

        // ── Insert projets ────────────────────────────────────────────────────
        $projetMap = [];
        foreach ($projetsData as $pd) {
            $projet = Projet::firstOrCreate(
                ['code' => $pd['code']],
                [
                    'pays_id'          => $senegal->id,
                    'programme_id'     => $programme->id,
                    'titre'            => $pd['titre'],
                    'description'      => "Microprojet {$pd['domaine']} — {$pd['categorie']}. Sigle : {$pd['sigle']}.",
                    'porteur'          => $pd['porteur'],
                    'commune'          => $pd['commune'],
                    'region'           => $pd['region'],
                    'montant_accorde'  => $pd['montant_accorde'],
                    'montant_decaisse' => $pd['montant_decaisse'],
                    'date_debut'       => '2008-01-01',
                    'date_fin_prevue'  => '2010-12-31',
                    'statut'           => $pd['statut'],
                    'completude'       => $pd['completude'],
                    'meta' => [
                        'sigle'        => $pd['sigle'],
                        'num_excel'    => $pd['num'],
                        'decision'     => $pd['decision'],
                        'accord_scac'  => $pd['accord_scac'],
                        'eligible'     => $pd['eligible'],
                        'evaluation'   => $pd['evaluation'],
                        'domaine'      => $pd['domaine'],
                        'categorie'    => $pd['categorie'],
                    ],
                ]
            );
            $projetMap[$pd['code']] = $projet;
        }

        // ── Insert décaissements ──────────────────────────────────────────────
        foreach ($decaissementsData as $code => $tranches) {
            if (!isset($projetMap[$code])) continue;
            $projet = $projetMap[$code];
            foreach ($tranches as $t) {
                Decaissement::firstOrCreate(
                    ['projet_id' => $projet->id, 'reference' => $t['reference']],
                    [
                        'created_by'         => $admin->id,
                        'date_decaissement'  => $t['date'],
                        'montant'            => $t['montant'],
                        'objet'              => $t['objet'],
                        'statut'             => 'effectue',
                    ]
                );
            }
        }

        // ── Insert missions de suivi ──────────────────────────────────────────
        foreach ($missionsData as $m) {
            $code = $numToCode[$m['num']] ?? null;
            if (!$code || !isset($projetMap[$code])) continue;
            $projet = $projetMap[$code];

            MissionTerrain::firstOrCreate(
                ['projet_id' => $projet->id, 'sync_uuid' => 'fsd-mission-' . $m['ref']],
                [
                    'agent_id'     => $agent->id,
                    'date_visite'  => $m['date'],
                    'observations' => $m['cr'],
                    'statut'       => 'valide',
                ]
            );
        }
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Pays;
use App\Models\Projet;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Utilisateur avec pays fixe : on l'impose. Admin : session globale.
        $paysId = $user->pays_id ?? $request->session()->get('selected_pays_id');

        $baseQuery = Projet::query()->when($paysId, fn($q) => $q->where('pays_id', $paysId));

        $allProjets = (clone $baseQuery)->get(['montant_accorde', 'montant_decaisse', 'statut', 'meta']);

        $total          = $allProjets->count();
        $actifs         = $allProjets->whereIn('statut', ['en_cours', 'termine'])->count();
        $subvention     = $allProjets->sum('montant_accorde');
        $decaisse       = $allProjets->sum('montant_decaisse');
        $tauxDecaisse   = $subvention > 0 ? round(($decaisse / $subvention) * 100) : 0;
        $eligibles      = $allProjets->filter(fn($p) => ($p->meta['eligible'] ?? false) === true)->count();

        $stats = [
            'total_projets'      => $total,
            'actifs'             => $actifs,
            'subvention_totale'  => $subvention,
            'total_decaisse'     => $decaisse,
            'taux_decaisse'      => $tauxDecaisse,
            'eligibles'          => $eligibles,
        ];

        $projets = (clone $baseQuery)
            ->with('pays:id,nom,cca2,devise')
            ->orderBy('completude', 'desc')
            ->get(['id', 'pays_id', 'code', 'titre', 'porteur', 'commune', 'region', 'statut', 'completude', 'montant_accorde', 'montant_decaisse', 'meta']);

        $programmes = \App\Models\Programme::when($paysId, fn($q) => $q->where('pays_id', $paysId))->get(['id', 'nom', 'code']);

        return Inertia::render('Dashboard', [
            'stats'      => $stats,
            'programmes' => $programmes,
            'projets' => $projets->map(fn($p) => [
                'id'               => $p->id,
                'code'             => $p->code,
                'titre'            => $p->titre,
                'porteur'          => $p->porteur,
                'commune'          => $p->commune,
                'region'           => $p->region,
                'statut'           => $p->statut,
                'completude'       => $p->completude,
                'montant_accorde'  => (float) $p->montant_accorde,
                'montant_decaisse' => (float) $p->montant_decaisse,
                'domaine'          => $p->meta['domaine']   ?? null,
                'categorie'        => $p->meta['categorie'] ?? null,
                'eligible'         => $p->meta['eligible']  ?? null,
                'pays_nom'         => $p->pays?->nom,
                'pays_cca2'        => $p->pays?->cca2,
                'devise'           => $p->pays?->devise ?? 'XOF',
            ]),
        ]);
    }
}

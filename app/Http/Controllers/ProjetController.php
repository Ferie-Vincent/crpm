<?php

namespace App\Http\Controllers;

use App\Models\Pays;
use App\Models\Programme;
use App\Models\Projet;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjetController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $activePaysId = $user->pays_id ?? $request->session()->get('selected_pays_id');

        $query = Projet::with(['pays', 'programme'])
            ->when($activePaysId, fn($q) => $q->where('pays_id', $activePaysId))
            ->when($request->statut, fn($q, $statut) => $q->where('statut', $statut))
            ->when($request->search, fn($q, $s) => $q->where(function ($q) use ($s) {
                $q->where('titre', 'like', "%$s%")->orWhere('code', 'like', "%$s%");
            }))
            ->latest()
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Projets/Index', [
            'projets' => $query,
            'filters' => $request->only(['statut', 'search']),
        ]);
    }

    public function create(Request $request)
    {
        $user = $request->user();
        $pays = Pays::when($user->pays_id, fn($q) => $q->where('id', $user->pays_id))->get(['id', 'nom', 'devise']);
        $programmes = Programme::when($user->pays_id, fn($q) => $q->where('pays_id', $user->pays_id))->get(['id', 'nom', 'code']);

        return Inertia::render('Projets/Create', [
            'pays'       => $pays,
            'programmes' => $programmes,
            'default_pays_id' => $user->pays_id,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'code'            => 'required|string|max:100|unique:projets,code',
            'titre'           => 'required|string|max:255',
            'porteur'         => 'nullable|string|max:255',
            'commune'         => 'nullable|string|max:255',
            'region'          => 'nullable|string|max:255',
            'pays_id'         => 'required|exists:pays,id',
            'programme_id'    => 'nullable|exists:programmes,id',
            'montant_accorde' => 'nullable|numeric|min:0',
            'date_debut'      => 'nullable|date',
            'date_fin_prevue' => 'nullable|date',
            'statut'          => 'required|in:en_preparation,en_cours,suspendu,termine,annule',
            'domaine'         => 'nullable|string|max:255',
            'categorie'       => 'nullable|string|max:255',
            'eligible'        => 'nullable|boolean',
            'decision'        => 'nullable|string|max:255',
            'accord_scac'     => 'nullable|boolean',
            'description'     => 'nullable|string',
        ]);

        if ($user->pays_id && $validated['pays_id'] != $user->pays_id) {
            abort(403);
        }

        $meta = array_filter([
            'domaine'    => $validated['domaine'] ?? null,
            'categorie'  => $validated['categorie'] ?? null,
            'eligible'   => isset($validated['eligible']) ? (bool)$validated['eligible'] : null,
            'decision'   => $validated['decision'] ?? null,
            'accord_scac'=> isset($validated['accord_scac']) ? (bool)$validated['accord_scac'] : null,
        ], fn($v) => $v !== null);

        $projet = Projet::create([
            'pays_id'         => $validated['pays_id'],
            'programme_id'    => $validated['programme_id'] ?? null,
            'code'            => strtoupper(trim($validated['code'])),
            'titre'           => $validated['titre'],
            'description'     => $validated['description'] ?? null,
            'porteur'         => $validated['porteur'] ?? null,
            'commune'         => $validated['commune'] ?? null,
            'region'          => $validated['region'] ?? null,
            'montant_accorde' => $validated['montant_accorde'] ?? 0,
            'montant_decaisse'=> 0,
            'date_debut'      => $validated['date_debut'] ?? null,
            'date_fin_prevue' => $validated['date_fin_prevue'] ?? null,
            'statut'          => $validated['statut'],
            'completude'      => 10,
            'meta'            => $meta ?: null,
        ]);

        return redirect()->route('projets.show', $projet)->with('success', 'Projet créé avec succès.');
    }

    public function show(Request $request, Projet $projet)
    {
        $this->authorisePays($projet);

        $projet->load([
            'pays',
            'programme',
            'decaissements'  => fn($q) => $q->latest('date_decaissement'),
            'missionsTerrain'=> fn($q) => $q->with('agent')->latest(),
            'phases'         => fn($q) => $q->withCount('activites')->orderBy('ordre'),
            'activites'      => fn($q) => $q->with('phase:id,nom')->orderBy('date_debut'),
            'documents'      => fn($q) => $q->latest(),
            'logs'           => fn($q) => $q->with('user:id,name')->latest()->limit(100),
        ]);

        $user = $request->user();
        $programmes = Programme::when($user->pays_id, fn($q) => $q->where('pays_id', $user->pays_id))
            ->orWhereNull('pays_id')
            ->orderBy('nom')
            ->get(['id', 'nom', 'code']);

        return Inertia::render('Projets/Show', [
            'projet'     => $projet,
            'programmes' => $programmes,
        ]);
    }

    public function edit(Projet $projet)
    {
        $this->authorisePays($projet);

        return Inertia::render('Projets/Edit', [
            'projet' => $projet->load('pays', 'programme'),
        ]);
    }

    public function update(Request $request, Projet $projet)
    {
        $this->authorisePays($projet);

        $validated = $request->validate([
            'titre'           => 'required|string|max:255',
            'description'     => 'nullable|string',
            'porteur'         => 'nullable|string|max:255',
            'commune'         => 'nullable|string|max:255',
            'region'          => 'nullable|string|max:255',
            'programme_id'    => 'nullable|exists:programmes,id',
            'montant_accorde' => 'nullable|numeric|min:0',
            'date_debut'      => 'nullable|date',
            'date_fin_prevue' => 'nullable|date',
            'statut'          => 'required|in:en_preparation,en_cours,suspendu,termine,annule',
            'domaine'         => 'nullable|string|max:255',
            'categorie'       => 'nullable|string|max:255',
            'eligible'        => 'nullable|boolean',
            'accord_scac'     => 'nullable|boolean',
            'decision'        => 'nullable|string|max:255',
        ]);

        $meta = array_merge($projet->meta ?? [], array_filter([
            'domaine'     => $validated['domaine']    ?? null,
            'categorie'   => $validated['categorie']  ?? null,
            'eligible'    => isset($validated['eligible'])    ? (bool)$validated['eligible']    : null,
            'accord_scac' => isset($validated['accord_scac']) ? (bool)$validated['accord_scac'] : null,
            'decision'    => $validated['decision']   ?? null,
        ], fn($v) => $v !== null));

        $projet->update([
            'titre'           => $validated['titre'],
            'description'     => $validated['description'] ?? null,
            'porteur'         => $validated['porteur'] ?? null,
            'commune'         => $validated['commune'] ?? null,
            'region'          => $validated['region'] ?? null,
            'programme_id'    => $validated['programme_id'] ?? null,
            'montant_accorde' => $validated['montant_accorde'] ?? $projet->montant_accorde,
            'date_debut'      => $validated['date_debut'] ?? null,
            'date_fin_prevue' => $validated['date_fin_prevue'] ?? null,
            'statut'          => $validated['statut'],
            'meta'            => $meta ?: null,
        ]);

        $projet->logAction('modification', "Projet modifié — statut : {$validated['statut']}");

        return back()->with('success', 'Projet mis à jour.');
    }

    public function storeDecaissement(Request $request, Projet $projet)
    {
        $this->authorisePays($projet);

        // Vérifier que le projet est éligible et en cours / terminé
        $eligible = $projet->meta['eligible'] ?? false;
        $statutOk = in_array($projet->statut, ['en_cours', 'termine']);

        if (!$eligible || !$statutOk) {
            return back()->withErrors(['decaissement' => 'Le décaissement nécessite un projet éligible et en cours ou terminé.']);
        }

        $validated = $request->validate([
            'date_decaissement' => 'required|date',
            'montant'           => 'required|numeric|min:1',
            'reference'         => 'nullable|string|max:100',
            'objet'             => 'nullable|string|max:255',
            'notes'             => 'nullable|string',
        ]);

        $projet->decaissements()->create([
            ...$validated,
            'created_by' => $request->user()->id,
            'statut'     => 'effectue',
        ]);

        // Recalculer montant_decaisse
        $projet->update([
            'montant_decaisse' => $projet->decaissements()->sum('montant'),
        ]);

        $projet->logAction('decaissement', "Décaissement enregistré — {$validated['montant']} ({$validated['date_decaissement']})", [
            'montant'    => $validated['montant'],
            'reference'  => $validated['reference'] ?? null,
        ]);

        return back()->with('success', 'Décaissement enregistré.');
    }

    public function exportPdf(Projet $projet)
    {
        $this->authorisePays($projet);
        // PDF generation via dompdf will be implemented as a queued job
        return response()->json(['message' => 'Export en cours de génération.']);
    }

    private function authorisePays(Projet $projet): void
    {
        $user = auth()->user();
        if ($user->pays_id && $projet->pays_id !== $user->pays_id) {
            abort(403);
        }
    }
}

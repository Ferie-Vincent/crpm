<?php

namespace App\Http\Controllers;

use App\Models\Pays;
use App\Models\Projet;
use App\Models\Rapport;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RapportController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $rapports = Rapport::with(['pays', 'createdBy'])
            ->when($user->pays_id, fn($q) => $q->where('pays_id', $user->pays_id))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        $pays = Pays::when($user->pays_id, fn($q) => $q->where('id', $user->pays_id))
            ->orderBy('nom')
            ->get(['id', 'nom', 'cca2']);

        return Inertia::render('Rapports/Index', [
            'rapports' => $rapports,
            'pays'     => $pays,
        ]);
    }

    public function create(Request $request)
    {
        $user = $request->user();
        $pays = Pays::when($user->pays_id, fn($q) => $q->where('id', $user->pays_id))->get(['id', 'nom']);

        return Inertia::render('Rapports/Create', [
            'pays' => $pays,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'pays_id'       => 'required|exists:pays,id',
            'titre'         => 'required|string|max:255',
            'template'      => 'required|in:SCAC,AFD,UE,generique',
            'format'        => 'required|in:pdf,excel',
            'periode_debut' => 'nullable|date',
            'periode_fin'   => 'nullable|date|after_or_equal:periode_debut',
            'sections'      => 'nullable|array',
        ]);

        $rapport = Rapport::create([
            ...$validated,
            'created_by' => $user->id,
            'statut'     => 'en_generation',
        ]);

        return redirect()->route('rapports.preview', $rapport);
    }

    public function preview(Rapport $rapport)
    {
        $this->authorisePays($rapport);

        $rapport->load(['pays', 'createdBy']);

        $projets = Projet::where('pays_id', $rapport->pays_id)
            ->when($rapport->periode_debut, fn($q) => $q->where('date_debut', '>=', $rapport->periode_debut))
            ->when($rapport->periode_fin, fn($q) => $q->where('date_debut', '<=', $rapport->periode_fin))
            ->select(['id', 'code', 'titre', 'statut', 'completude', 'montant_accorde', 'montant_decaisse'])
            ->get();

        $stats = [
            'total_projets'   => $projets->count(),
            'completude_moy'  => $projets->avg('completude') ?? 0,
            'total_accorde'   => $projets->sum('montant_accorde'),
            'total_decaisse'  => $projets->sum('montant_decaisse'),
        ];

        return Inertia::render('Rapports/Preview', [
            'rapport' => $rapport,
            'projets' => $projets,
            'stats'   => $stats,
        ]);
    }

    public function generate(Rapport $rapport)
    {
        $this->authorisePays($rapport);

        // Dispatch async job — placeholder until Job class is created
        $rapport->update(['statut' => 'en_generation']);

        return response()->json(['message' => 'Génération lancée.']);
    }

    public function show(Rapport $rapport)
    {
        $this->authorisePays($rapport);
        return Inertia::render('Rapports/Show', ['rapport' => $rapport->load(['pays', 'createdBy'])]);
    }

    public function download(Rapport $rapport)
    {
        $this->authorisePays($rapport);

        if (!$rapport->fichier_path || !file_exists(storage_path("app/{$rapport->fichier_path}"))) {
            abort(404, 'Fichier non disponible.');
        }

        return response()->download(storage_path("app/{$rapport->fichier_path}"));
    }

    public function destroy(Rapport $rapport)
    {
        $this->authorisePays($rapport);
        $rapport->delete();
        return redirect()->route('rapports.index')->with('success', 'Rapport supprimé.');
    }

    private function authorisePays(Rapport $rapport): void
    {
        $user = auth()->user();
        if ($user->pays_id && $rapport->pays_id !== $user->pays_id) {
            abort(403);
        }
    }
}

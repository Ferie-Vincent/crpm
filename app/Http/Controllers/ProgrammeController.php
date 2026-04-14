<?php

namespace App\Http\Controllers;

use App\Models\Pays;
use App\Models\Programme;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProgrammeController extends Controller
{
    public function index(Request $request)
    {
        $user   = $request->user();
        $paysId = $user->pays_id ?? $request->session()->get('selected_pays_id');

        $programmes = Programme::with(['paysCibles:id,nom,cca2'])
            ->withCount('projets')
            ->when($paysId, fn($q) => $q->where(fn($q2) =>
                $q2->whereNull('pays_id')
                   ->orWhereHas('paysCibles', fn($q3) => $q3->where('pays.id', $paysId))
            ))
            ->orderBy('nom')
            ->get()
            ->map(fn($p) => [
                'id'            => $p->id,
                'code'          => $p->code,
                'nom'           => $p->nom,
                'description'     => $p->description,
                'bailleur'        => $p->bailleur,
                'appui_technique' => $p->appui_technique,
                'date_debut'    => $p->date_debut?->format('Y-m-d'),
                'date_fin'      => $p->date_fin?->format('Y-m-d'),
                'statut'        => $p->statut,
                'projets_count' => $p->projets_count,
                'pays_ids'      => $p->paysCibles->pluck('id')->values(),
                'pays_couverts' => $p->paysCibles->map(fn($pay) => [
                    'id'   => $pay->id,
                    'nom'  => $pay->nom,
                    'cca2' => $pay->cca2,
                ])->values(),
            ]);

        $pays = Pays::when($user->pays_id, fn($q) => $q->where('id', $user->pays_id))
            ->orderBy('nom')
            ->get(['id', 'nom', 'cca2']);

        return Inertia::render('Programmes/Index', [
            'programmes' => $programmes,
            'pays'       => $pays,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'pays_ids'    => 'nullable|array',
            'pays_ids.*'  => 'exists:pays,id',
            'code'        => 'required|string|max:30|unique:programmes,code',
            'nom'         => 'required|string|max:255',
            'description' => 'nullable|string',
            'bailleur'        => 'nullable|string|max:255',
            'appui_technique' => 'nullable|string|max:255',
            'date_debut'      => 'nullable|date',
            'date_fin'        => 'nullable|date|after_or_equal:date_debut',
            'statut'          => 'required|in:actif,cloture,suspendu,archive',
        ]);

        $programme = Programme::create([
            'code'            => $validated['code'],
            'nom'             => $validated['nom'],
            'description'     => $validated['description'] ?? null,
            'bailleur'        => $validated['bailleur'] ?? null,
            'appui_technique' => $validated['appui_technique'] ?? null,
            'date_debut'  => $validated['date_debut'] ?? null,
            'date_fin'    => $validated['date_fin'] ?? null,
            'statut'      => $validated['statut'],
        ]);

        $programme->paysCibles()->sync($validated['pays_ids'] ?? []);

        return back()->with('success', "Programme « {$validated['nom']} » créé avec succès.");
    }

    public function update(Request $request, Programme $programme)
    {
        $validated = $request->validate([
            'pays_ids'    => 'nullable|array',
            'pays_ids.*'  => 'exists:pays,id',
            'code'        => 'required|string|max:30|unique:programmes,code,' . $programme->id,
            'nom'         => 'required|string|max:255',
            'description' => 'nullable|string',
            'bailleur'        => 'nullable|string|max:255',
            'appui_technique' => 'nullable|string|max:255',
            'date_debut'      => 'nullable|date',
            'date_fin'        => 'nullable|date|after_or_equal:date_debut',
            'statut'          => 'required|in:actif,cloture,suspendu,archive',
        ]);

        $programme->update([
            'code'            => $validated['code'],
            'nom'             => $validated['nom'],
            'description'     => $validated['description'] ?? null,
            'bailleur'        => $validated['bailleur'] ?? null,
            'appui_technique' => $validated['appui_technique'] ?? null,
            'date_debut'  => $validated['date_debut'] ?? null,
            'date_fin'    => $validated['date_fin'] ?? null,
            'statut'      => $validated['statut'],
        ]);

        $programme->paysCibles()->sync($validated['pays_ids'] ?? []);

        return back()->with('success', 'Programme mis à jour.');
    }

    public function archive(Programme $programme)
    {
        $programme->update(['statut' => 'archive']);
        return back()->with('success', "Programme « {$programme->nom} » archivé.");
    }

    public function restore(Programme $programme)
    {
        $programme->update(['statut' => 'actif']);
        return back()->with('success', "Programme « {$programme->nom} » restauré.");
    }

    public function destroy(Programme $programme)
    {
        if ($programme->projets()->exists()) {
            return back()->withErrors(['delete' => 'Ce programme a des projets associés et ne peut pas être supprimé.']);
        }

        $programme->delete();

        return back()->with('success', 'Programme supprimé.');
    }
}

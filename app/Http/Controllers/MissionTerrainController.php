<?php

namespace App\Http\Controllers;

use App\Models\MissionTerrain;
use App\Models\Projet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MissionTerrainController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $missions = MissionTerrain::with(['projet.pays', 'agent'])
            ->where('agent_id', $user->id)
            ->latest()
            ->paginate(20);

        return Inertia::render('Missions/Index', [
            'missions' => $missions,
        ]);
    }

    public function create(Request $request)
    {
        $user = $request->user();

        $projets = Projet::when($user->pays_id, fn($q) => $q->where('pays_id', $user->pays_id))
            ->where('statut', 'en_cours')
            ->get(['id', 'code', 'titre']);

        return Inertia::render('Missions/Create', [
            'projets' => $projets,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'projet_id'       => 'required|exists:projets,id',
            'date_visite'     => 'required|date',
            'observations'    => 'nullable|string',
            'points_positifs' => 'nullable|string',
            'points_negatifs' => 'nullable|string',
            'recommandations' => 'nullable|string',
            'latitude'        => 'nullable|numeric|between:-90,90',
            'longitude'       => 'nullable|numeric|between:-180,180',
            'sync_uuid'       => 'nullable|string|uuid',
            'photos'          => 'nullable|array',
            'photos.*'        => 'file|image|max:2048',
        ]);

        // Deduplicate offline syncs by UUID
        if (!empty($validated['sync_uuid'])) {
            $existing = MissionTerrain::where('sync_uuid', $validated['sync_uuid'])->first();
            if ($existing) {
                return response()->json(['id' => $existing->id, 'duplicate' => true]);
            }
        }

        $photoPaths = [];
        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $photoPaths[] = $photo->store('missions/photos', 'public');
            }
        }

        $mission = MissionTerrain::create([
            ...$validated,
            'agent_id' => $user->id,
            'photos'   => $photoPaths ?: null,
            'statut'   => 'soumis',
        ]);

        if ($request->wantsJson()) {
            return response()->json(['id' => $mission->id]);
        }

        return redirect()->route('missions.show', $mission)->with('success', 'Mission enregistrée.');
    }

    public function show(MissionTerrain $mission)
    {
        return Inertia::render('Missions/Show', [
            'mission' => $mission->load(['projet.pays', 'agent']),
        ]);
    }

    public function update(Request $request, MissionTerrain $mission)
    {
        $validated = $request->validate([
            'statut' => 'required|in:brouillon,soumis,valide',
        ]);

        $mission->update($validated);

        return back()->with('success', 'Mission mise à jour.');
    }
}

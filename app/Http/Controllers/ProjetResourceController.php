<?php

namespace App\Http\Controllers;

use App\Models\Activite;
use App\Models\Document;
use App\Models\MissionTerrain;
use App\Models\Phase;
use App\Models\Projet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProjetResourceController extends Controller
{
    // ── Phases ───────────────────────────────────────────────────────────────

    public function storePhase(Request $request, Projet $projet)
    {
        $validated = $request->validate([
            'nom'         => 'required|string|max:255',
            'description' => 'nullable|string',
            'ordre'       => 'nullable|integer|min:0',
            'statut'      => 'required|in:planifie,en_cours,complete,reporte',
            'date_debut'  => 'nullable|date',
            'date_fin'    => 'nullable|date|after_or_equal:date_debut',
        ]);

        // Ordre auto si non fourni
        $validated['ordre'] ??= $projet->phases()->max('ordre') + 1;

        $projet->phases()->create($validated);
        $projet->logAction('phase', "Phase créée : {$validated['nom']}");

        return back()->with('success', 'Phase créée.');
    }

    public function updatePhase(Request $request, Projet $projet, Phase $phase)
    {
        abort_if($phase->projet_id !== $projet->id, 404);

        $validated = $request->validate([
            'nom'              => 'required|string|max:255',
            'description'      => 'nullable|string',
            'ordre'            => 'nullable|integer|min:0',
            'statut'           => 'required|in:planifie,en_cours,complete,reporte',
            'date_debut'       => 'nullable|date',
            'date_fin'         => 'nullable|date|after_or_equal:date_debut',
            'date_fin_reelle'  => 'nullable|date',
        ]);

        $phase->update($validated);
        $projet->logAction('phase', "Phase modifiée : {$validated['nom']}");

        return back()->with('success', 'Phase mise à jour.');
    }

    public function destroyPhase(Projet $projet, Phase $phase)
    {
        abort_if($phase->projet_id !== $projet->id, 404);
        $nom = $phase->nom;
        $phase->delete();
        $projet->logAction('phase', "Phase supprimée : {$nom}");
        return back()->with('success', 'Phase supprimée.');
    }

    // ── Activités ─────────────────────────────────────────────────────────────

    public function storeActivite(Request $request, Projet $projet)
    {
        $validated = $request->validate([
            'phase_id'       => 'nullable|exists:phases,id',
            'nom'            => 'required|string|max:255',
            'description'    => 'nullable|string',
            'responsable'    => 'nullable|string|max:255',
            'date_debut'     => 'nullable|date',
            'date_fin_prevue'=> 'nullable|date|after_or_equal:date_debut',
            'statut'         => 'required|in:planifie,en_cours,complete,annule',
            'progression'    => 'nullable|integer|min:0|max:100',
        ]);

        $projet->activites()->create($validated);
        $projet->logAction('activite', "Activité créée : {$validated['nom']}");

        return back()->with('success', 'Activité créée.');
    }

    public function updateActivite(Request $request, Projet $projet, Activite $activite)
    {
        abort_if($activite->projet_id !== $projet->id, 404);

        $validated = $request->validate([
            'phase_id'        => 'nullable|exists:phases,id',
            'nom'             => 'required|string|max:255',
            'description'     => 'nullable|string',
            'responsable'     => 'nullable|string|max:255',
            'date_debut'      => 'nullable|date',
            'date_fin_prevue' => 'nullable|date|after_or_equal:date_debut',
            'date_fin_reelle' => 'nullable|date',
            'statut'          => 'required|in:planifie,en_cours,complete,annule',
            'progression'     => 'nullable|integer|min:0|max:100',
        ]);

        $activite->update($validated);
        $projet->logAction('activite', "Activité modifiée : {$validated['nom']}");

        return back()->with('success', 'Activité mise à jour.');
    }

    public function destroyActivite(Projet $projet, Activite $activite)
    {
        abort_if($activite->projet_id !== $projet->id, 404);
        $nom = $activite->nom;
        $activite->delete();
        $projet->logAction('activite', "Activité supprimée : {$nom}");
        return back()->with('success', 'Activité supprimée.');
    }

    // ── Documents ─────────────────────────────────────────────────────────────

    public function storeDocument(Request $request, Projet $projet)
    {
        $request->validate([
            'fichier'   => 'required|file|max:20480', // 20 MB max
            'categorie' => 'nullable|string|max:100',
        ]);

        $file = $request->file('fichier');
        $chemin = $file->store("projets/{$projet->id}/documents", 'public');

        $projet->documents()->create([
            'uploaded_by'  => $request->user()->id,
            'nom_original' => $file->getClientOriginalName(),
            'chemin'       => $chemin,
            'mime_type'    => $file->getMimeType(),
            'taille'       => $file->getSize(),
            'categorie'    => $request->input('categorie') ?? 'autre',
        ]);

        $projet->logAction('document', "Document ajouté : {$file->getClientOriginalName()}");

        return back()->with('success', 'Document ajouté.');
    }

    public function destroyDocument(Projet $projet, Document $document)
    {
        abort_if($document->documentable_id !== $projet->id || $document->documentable_type !== Projet::class, 404);

        $nom = $document->nom_original;
        Storage::disk('public')->delete($document->chemin);
        $document->delete();

        $projet->logAction('document', "Document supprimé : {$nom}");

        return back()->with('success', 'Document supprimé.');
    }

    // ── Missions de suivi ─────────────────────────────────────────────────────

    public function storeMission(Request $request, Projet $projet)
    {
        $validated = $request->validate([
            'date_visite'     => 'required|date',
            'observations'    => 'nullable|string',
            'points_positifs' => 'nullable|string',
            'points_negatifs' => 'nullable|string',
            'recommandations' => 'nullable|string',
            'latitude'        => 'nullable|numeric|between:-90,90',
            'longitude'       => 'nullable|numeric|between:-180,180',
        ]);

        MissionTerrain::create([
            ...$validated,
            'projet_id' => $projet->id,
            'agent_id'  => $request->user()->id,
            'statut'    => 'soumis',
        ]);

        $projet->logAction('mission', "Mission de suivi enregistrée le {$validated['date_visite']}");

        return back()->with('success', 'Mission enregistrée.');
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Parametre;
use App\Models\Pays;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class ParametreController extends Controller
{
    public function index(Request $request)
    {
        $user   = $request->user();
        $paysId = $user->pays_id;

        // Completions
        $completions = [
            'organisation' => $this->sectionCompletion($paysId, ['nom_organisation', 'logo', 'adresse']),
            'devise'       => $this->sectionCompletion($paysId, ['devise', 'symbole_devise']),
            'systeme'      => $this->sectionCompletion($paysId, ['timezone', 'seuil_completude']),
        ];

        // Utilisateurs
        $utilisateurs = User::with('roles')
            ->when($paysId, fn($q) => $q->where('pays_id', $paysId))
            ->get()
            ->map(fn($u) => [
                'id'      => $u->id,
                'name'    => $u->name,
                'email'   => $u->email,
                'roles'   => $u->roles->pluck('name'),
                'pays_id' => $u->pays_id,
            ]);

        // Pays
        $paysList = Pays::withCount('projets')->orderBy('nom')->get(['id', 'code', 'cca2', 'nom', 'devise', 'statut']);

        // Paramètres
        $parametres = Parametre::where('pays_id', $paysId)
            ->orWhereNull('pays_id')
            ->get()
            ->keyBy('cle')
            ->map(fn($p) => $p->valeur);

        return Inertia::render('Parametres/Index', [
            'completions'  => $completions,
            'utilisateurs' => $utilisateurs,
            'pays'         => $paysList,
            'roles'        => Role::all(['id', 'name']),
            'pays_invite'  => Pays::when($paysId, fn($q) => $q->where('id', $paysId))->get(['id', 'nom']),
            'parametres'   => $parametres,
        ]);
    }

    public function utilisateurs(Request $request)
    {
        $user = $request->user();

        $utilisateurs = User::with('roles')
            ->when($user->pays_id, fn($q) => $q->where('pays_id', $user->pays_id))
            ->get()
            ->map(fn($u) => [
                'id'     => $u->id,
                'name'   => $u->name,
                'email'  => $u->email,
                'roles'  => $u->roles->pluck('name'),
                'pays_id' => $u->pays_id,
            ]);

        $roles = Role::all(['id', 'name']);
        $pays  = Pays::when($user->pays_id, fn($q) => $q->where('id', $user->pays_id))->get(['id', 'nom']);

        return Inertia::render('Parametres/Utilisateurs', [
            'utilisateurs' => $utilisateurs,
            'roles'        => $roles,
            'pays'         => $pays,
        ]);
    }

    public function inviterUtilisateur(Request $request)
    {
        $validated = $request->validate([
            'email'   => 'required|email|unique:users,email',
            'role'    => 'required|exists:roles,name',
            'pays_id' => 'required|exists:pays,id',
        ]);

        // Create user with temp password; they'll reset via email link
        $newUser = User::create([
            'name'     => explode('@', $validated['email'])[0],
            'email'    => $validated['email'],
            'password' => bcrypt(\Illuminate\Support\Str::random(32)),
            'pays_id'  => $validated['pays_id'],
        ]);

        $newUser->assignRole($validated['role']);

        // Send password reset notification (72h valid) as invite mechanism
        $token = app('auth.password.broker')->createToken($newUser);
        $newUser->sendPasswordResetNotification($token);

        return back()->with('success', "Invitation envoyée à {$validated['email']}.");
    }

    public function programme(Request $request)
    {
        $user = $request->user();
        $paysId = $user->pays_id;

        $parametres = Parametre::where('pays_id', $paysId)
            ->orWhereNull('pays_id')
            ->get()
            ->keyBy('cle')
            ->map(fn($p) => $p->valeur);

        return Inertia::render('Parametres/Programme', [
            'parametres' => $parametres,
        ]);
    }

    public function updateProgramme(Request $request)
    {
        $user = $request->user();
        $paysId = $user->pays_id;

        $validated = $request->validate([
            'nom_organisation' => 'nullable|string|max:255',
            'devise'           => 'nullable|string|max:10',
            'symbole_devise'   => 'nullable|string|max:5',
            'timezone'         => 'nullable|string|max:50',
            'seuil_completude' => 'nullable|integer|min:0|max:100',
        ]);

        foreach ($validated as $cle => $valeur) {
            Parametre::updateOrCreate(
                ['pays_id' => $paysId, 'cle' => $cle],
                ['valeur' => $valeur]
            );
        }

        return back()->with('success', 'Paramètres mis à jour.');
    }

    public function pays()
    {
        $pays = Pays::withCount('projets')->orderBy('nom')->get(['id', 'code', 'cca2', 'nom', 'devise', 'statut']);

        return Inertia::render('Parametres/Pays', [
            'pays' => $pays,
        ]);
    }

    public function storePays(Request $request)
    {
        $validated = $request->validate([
            'code'   => 'required|string|max:3|unique:pays,code',
            'cca2'   => 'nullable|string|max:2',
            'nom'    => 'required|string|max:255',
            'devise' => 'nullable|string|max:10',
            'statut' => 'required|in:actif,en_cours,cloture',
        ]);

        Pays::create([
            'code'   => strtoupper($validated['code']),
            'cca2'   => strtolower($validated['cca2'] ?? ''),
            'nom'    => $validated['nom'],
            'devise' => $validated['devise'] ?? 'XOF',
            'statut' => $validated['statut'],
        ]);

        return back()->with('success', "Pays « {$validated['nom']} » créé avec succès.");
    }

    public function updatePays(Request $request, Pays $pays)
    {
        $validated = $request->validate([
            'nom'    => 'required|string|max:255',
            'devise' => 'nullable|string|max:10',
            'statut' => 'required|in:actif,en_cours,cloture',
        ]);

        $pays->update($validated);

        return back()->with('success', 'Pays mis à jour.');
    }

    public function destroyPays(Pays $pays)
    {
        if ($pays->projets()->exists()) {
            return back()->withErrors(['delete' => 'Ce pays a des projets associés et ne peut pas être supprimé.']);
        }

        $pays->delete();

        return back()->with('success', 'Pays supprimé.');
    }

    public function selectPays(Request $request)
    {
        $paysId = $request->input('pays_id');
        if ($paysId) {
            $request->session()->put('selected_pays_id', (int) $paysId);
        } else {
            $request->session()->forget('selected_pays_id');
        }
        return back();
    }

    private function sectionCompletion(?int $paysId, array $cles): int
    {
        if (!$paysId) return 0;
        $filled = Parametre::where('pays_id', $paysId)
            ->whereIn('cle', $cles)
            ->whereNotNull('valeur')
            ->count();
        return (int) round(($filled / count($cles)) * 100);
    }
}

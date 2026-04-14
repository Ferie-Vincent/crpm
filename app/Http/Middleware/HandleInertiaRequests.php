<?php

namespace App\Http\Middleware;

use App\Models\Parametre;
use App\Models\Pays;
use App\Services\CurrencyService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        // Pays actif : verrouillé sur l'utilisateur, ou choix en session (admin)
        $activePaysId = $user?->pays_id ?? $request->session()->get('selected_pays_id');

        $paysList = $user
            ? Pays::when($user->pays_id, fn($q) => $q->where('id', $user->pays_id))
                  ->orderBy('nom')
                  ->get(['id', 'code', 'cca2', 'nom', 'devise'])
                  ->toArray()
            : [];

        // Devise d'affichage globale (paramètre 'devise' : 'locale' | 'USD' | 'EUR')
        // Priorité : pays de l'utilisateur > pays sélectionné en session (admin) > global (NULL)
        $deviseAffichage = 'locale';
        if ($user) {
            $paramPaysId = $user->pays_id ?? $activePaysId;
            $deviseAffichage = Parametre::where('cle', 'devise')
                ->when(
                    $paramPaysId,
                    fn($q) => $q->where('pays_id', $paramPaysId),
                    fn($q) => $q->whereNull('pays_id')
                )
                ->value('valeur') ?? 'locale';
        }

        // Taux de change live (1 EUR = X devise) — mis en cache 24 h
        $tauxEur = CurrencyService::getRatesVsEur();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? $user->load('roles:id,name') : null,
            ],
            'pays_list'        => $paysList,
            'active_pays_id'   => $activePaysId ? (int) $activePaysId : null,
            'user_pays_id'     => $user?->pays_id ? (int) $user->pays_id : null,
            'devise_affichage' => $deviseAffichage,
            'taux_eur'         => $tauxEur,
        ];
    }
}

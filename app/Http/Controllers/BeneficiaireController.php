<?php

namespace App\Http\Controllers;

use App\Imports\BeneficiairesImport;
use App\Models\Beneficiaire;
use App\Models\Pays;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class BeneficiaireController extends Controller
{
    public function importForm(Request $request)
    {
        $user = $request->user();
        $pays = Pays::when($user->pays_id, fn($q) => $q->where('id', $user->pays_id))->get(['id', 'nom']);

        return Inertia::render('Parametres/ImportBeneficiaires', [
            'pays' => $pays,
        ]);
    }

    public function preview(Request $request)
    {
        $request->validate([
            'fichier'  => 'required|file|mimes:xlsx,xls,csv|max:10240',
            'pays_id'  => 'required|exists:pays,id',
        ]);

        $rows = Excel::toArray(new BeneficiairesImport(), $request->file('fichier'));
        $headers = array_shift($rows[0]) ?? [];
        $preview = array_slice($rows[0] ?? [], 0, 10);

        return response()->json([
            'headers' => $headers,
            'preview' => $preview,
            'total'   => count($rows[0] ?? []),
        ]);
    }

    public function import(Request $request)
    {
        $request->validate([
            'fichier' => 'required|file|mimes:xlsx,xls,csv|max:10240',
            'pays_id' => 'required|exists:pays,id',
        ]);

        Excel::import(
            new BeneficiairesImport($request->pays_id),
            $request->file('fichier')
        );

        return back()->with('success', 'Import terminé avec succès.');
    }
}

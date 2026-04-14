<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjetController;
use App\Http\Controllers\RapportController;
use App\Http\Controllers\ProjetResourceController;
use App\Http\Controllers\ParametreController;
use App\Http\Controllers\ProgrammeController;
use App\Http\Controllers\BeneficiaireController;
use App\Http\Controllers\MissionTerrainController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::redirect('/', '/login');

Route::middleware(['auth', 'verified'])->group(function () {
    // Sélection du pays actif (admin)
    Route::post('/select-pays', [ParametreController::class, 'selectPays'])->name('select-pays');

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Projets
    Route::resource('projets', ProjetController::class)->only(['index', 'show', 'create', 'store', 'edit', 'update']);
    Route::post('/projets/{projet}/export-pdf', [ProjetController::class, 'exportPdf'])->name('projets.export-pdf');
    Route::post('/projets/{projet}/decaissements', [ProjetController::class, 'storeDecaissement'])->name('projets.decaissements.store');

    // Phases
    Route::post('/projets/{projet}/phases', [ProjetResourceController::class, 'storePhase']);
    Route::put('/projets/{projet}/phases/{phase}', [ProjetResourceController::class, 'updatePhase']);
    Route::delete('/projets/{projet}/phases/{phase}', [ProjetResourceController::class, 'destroyPhase']);

    // Activités
    Route::post('/projets/{projet}/activites', [ProjetResourceController::class, 'storeActivite']);
    Route::put('/projets/{projet}/activites/{activite}', [ProjetResourceController::class, 'updateActivite']);
    Route::delete('/projets/{projet}/activites/{activite}', [ProjetResourceController::class, 'destroyActivite']);

    // Documents
    Route::post('/projets/{projet}/documents', [ProjetResourceController::class, 'storeDocument']);
    Route::delete('/projets/{projet}/documents/{document}', [ProjetResourceController::class, 'destroyDocument']);

    // Missions de suivi depuis un projet
    Route::post('/projets/{projet}/missions', [ProjetResourceController::class, 'storeMission'])->name('projets.missions.store');

    // Programmes
    Route::get('/programmes', [ProgrammeController::class, 'index'])->name('programmes.index');
    Route::post('/programmes', [ProgrammeController::class, 'store'])->name('programmes.store');
    Route::put('/programmes/{programme}', [ProgrammeController::class, 'update'])->name('programmes.update');
    Route::delete('/programmes/{programme}', [ProgrammeController::class, 'destroy'])->name('programmes.destroy');
    Route::post('/programmes/{programme}/archiver', [ProgrammeController::class, 'archive'])->name('programmes.archive');
    Route::post('/programmes/{programme}/restaurer', [ProgrammeController::class, 'restore'])->name('programmes.restore');

    // Rapports
    Route::resource('rapports', RapportController::class)->only(['index', 'create', 'store', 'show', 'destroy']);
    Route::get('/rapports/{rapport}/preview', [RapportController::class, 'preview'])->name('rapports.preview');
    Route::post('/rapports/{rapport}/generate', [RapportController::class, 'generate'])->name('rapports.generate');
    Route::get('/rapports/{rapport}/download', [RapportController::class, 'download'])->name('rapports.download');

    // Missions terrain
    Route::resource('missions', MissionTerrainController::class)->only(['index', 'create', 'store', 'show', 'update']);

    // Bénéficiaires
    Route::get('/beneficiaires/import', [BeneficiaireController::class, 'importForm'])->name('beneficiaires.import');
    Route::post('/beneficiaires/import', [BeneficiaireController::class, 'import'])->name('beneficiaires.import.store');
    Route::get('/beneficiaires/preview', [BeneficiaireController::class, 'preview'])->name('beneficiaires.preview');

    // Paramètres
    Route::get('/parametres', [ParametreController::class, 'index'])->name('parametres.index');
    Route::get('/parametres/utilisateurs', [ParametreController::class, 'utilisateurs'])->name('parametres.utilisateurs');
    Route::post('/parametres/utilisateurs/inviter', [ParametreController::class, 'inviterUtilisateur'])->name('parametres.utilisateurs.inviter');
    Route::get('/parametres/programme', [ParametreController::class, 'programme'])->name('parametres.programme');
    Route::put('/parametres/programme', [ParametreController::class, 'updateProgramme'])->name('parametres.programme.update');
    Route::get('/parametres/pays', [ParametreController::class, 'pays'])->name('parametres.pays');
    Route::post('/parametres/pays', [ParametreController::class, 'storePays'])->name('parametres.pays.store');
    Route::put('/parametres/pays/{pays}', [ParametreController::class, 'updatePays'])->name('parametres.pays.update');
    Route::delete('/parametres/pays/{pays}', [ParametreController::class, 'destroyPays'])->name('parametres.pays.destroy');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

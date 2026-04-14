<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Activite extends Model
{
    protected $fillable = [
        'projet_id', 'phase_id', 'nom', 'description', 'responsable',
        'date_debut', 'date_fin_prevue', 'date_fin_reelle', 'statut', 'progression',
    ];

    protected $casts = [
        'date_debut'      => 'date',
        'date_fin_prevue' => 'date',
        'date_fin_reelle' => 'date',
    ];

    public function projet()
    {
        return $this->belongsTo(Projet::class);
    }

    public function phase()
    {
        return $this->belongsTo(Phase::class);
    }
}

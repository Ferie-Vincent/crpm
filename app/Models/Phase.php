<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Phase extends Model
{
    protected $fillable = [
        'projet_id', 'nom', 'description', 'ordre', 'statut',
        'date_debut', 'date_fin', 'date_fin_reelle',
    ];

    protected $casts = [
        'date_debut'     => 'date',
        'date_fin'       => 'date',
        'date_fin_reelle'=> 'date',
    ];

    public function projet()
    {
        return $this->belongsTo(Projet::class);
    }

    public function activites()
    {
        return $this->hasMany(Activite::class);
    }
}

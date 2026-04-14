<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Programme extends Model
{
    protected $fillable = ['pays_id', 'code', 'nom', 'description', 'bailleur', 'appui_technique', 'date_debut', 'date_fin', 'statut'];

    protected $casts = [
        'date_debut' => 'date',
        'date_fin'   => 'date',
    ];

    public function pays()
    {
        return $this->belongsTo(Pays::class);
    }

    public function paysCibles()
    {
        return $this->belongsToMany(Pays::class, 'programme_pays')->orderBy('nom');
    }

    public function projets()
    {
        return $this->hasMany(Projet::class);
    }
}

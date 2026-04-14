<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rapport extends Model
{
    protected $fillable = [
        'pays_id', 'created_by', 'titre', 'template', 'format',
        'periode_debut', 'periode_fin', 'sections', 'statut', 'fichier_path',
    ];

    protected $casts = [
        'periode_debut' => 'date',
        'periode_fin'   => 'date',
        'sections'      => 'array',
    ];

    public function pays()
    {
        return $this->belongsTo(Pays::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}

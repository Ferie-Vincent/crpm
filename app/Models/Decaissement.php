<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Decaissement extends Model
{
    protected $fillable = [
        'projet_id', 'created_by', 'date_decaissement', 'montant',
        'reference', 'objet', 'statut', 'justificatif_path', 'notes',
    ];

    protected $casts = [
        'date_decaissement' => 'date',
        'montant'           => 'decimal:2',
    ];

    public function projet()
    {
        return $this->belongsTo(Projet::class);
    }
}

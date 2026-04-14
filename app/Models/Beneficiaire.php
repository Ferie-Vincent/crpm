<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Beneficiaire extends Model
{
    protected $fillable = [
        'pays_id', 'projet_id', 'nom', 'prenom', 'genre',
        'telephone', 'commune', 'village', 'activite_principale', 'meta',
    ];

    protected $casts = ['meta' => 'array'];
}

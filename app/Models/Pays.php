<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pays extends Model
{
    protected $fillable = ['code', 'cca2', 'nom', 'devise', 'statut'];

    public function projets()
    {
        return $this->hasMany(Projet::class);
    }

    public function utilisateurs()
    {
        return $this->hasMany(User::class);
    }
}

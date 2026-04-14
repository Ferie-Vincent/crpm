<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Parametre extends Model
{
    protected $fillable = ['pays_id', 'cle', 'valeur', 'type'];
}

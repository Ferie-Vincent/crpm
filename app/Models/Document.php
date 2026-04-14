<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    protected $fillable = [
        'documentable_type', 'documentable_id', 'uploaded_by',
        'nom_original', 'chemin', 'mime_type', 'taille', 'categorie',
    ];

    public function documentable()
    {
        return $this->morphTo();
    }

    public function uploadedBy()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}

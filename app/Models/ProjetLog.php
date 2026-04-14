<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjetLog extends Model
{
    protected $table = 'projet_logs';

    protected $fillable = [
        'projet_id', 'user_id', 'type', 'description', 'meta',
    ];

    protected $casts = [
        'meta' => 'array',
    ];

    public function projet()
    {
        return $this->belongsTo(Projet::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MissionTerrain extends Model
{
    protected $table = 'missions_terrain';

    protected $fillable = [
        'projet_id', 'agent_id', 'date_visite', 'observations',
        'points_positifs', 'points_negatifs', 'recommandations',
        'latitude', 'longitude', 'statut', 'photos', 'sync_uuid',
    ];

    protected $casts = [
        'date_visite' => 'date',
        'photos'      => 'array',
        'latitude'    => 'decimal:7',
        'longitude'   => 'decimal:7',
    ];

    public function projet()
    {
        return $this->belongsTo(Projet::class);
    }

    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id');
    }
}

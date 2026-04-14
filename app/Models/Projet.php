<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Projet extends Model
{
    use \Illuminate\Database\Eloquent\SoftDeletes;

    protected $fillable = [
        'pays_id', 'programme_id', 'code', 'titre', 'description', 'porteur',
        'commune', 'region', 'montant_accorde', 'montant_decaisse', 'date_debut',
        'date_fin_prevue', 'date_fin_reelle', 'statut', 'completude', 'meta',
    ];

    protected $casts = [
        'date_debut' => 'date',
        'date_fin_prevue' => 'date',
        'date_fin_reelle' => 'date',
        'montant_accorde' => 'decimal:2',
        'montant_decaisse' => 'decimal:2',
        'meta' => 'array',
    ];

    public function pays()
    {
        return $this->belongsTo(Pays::class);
    }

    public function programme()
    {
        return $this->belongsTo(Programme::class);
    }

    public function decaissements()
    {
        return $this->hasMany(Decaissement::class);
    }

    public function beneficiaires()
    {
        return $this->hasMany(Beneficiaire::class);
    }

    public function missionsTerrain()
    {
        return $this->hasMany(MissionTerrain::class);
    }

    public function phases()
    {
        return $this->hasMany(Phase::class)->orderBy('ordre');
    }

    public function activites()
    {
        return $this->hasMany(Activite::class);
    }

    public function documents()
    {
        return $this->morphMany(Document::class, 'documentable');
    }

    public function logs()
    {
        return $this->hasMany(ProjetLog::class)->latest();
    }

    public function logAction(string $type, string $description, array $meta = [], ?int $userId = null): void
    {
        $this->logs()->create([
            'user_id'     => $userId ?? auth()->id(),
            'type'        => $type,
            'description' => $description,
            'meta'        => $meta ?: null,
        ]);
    }

    public function scopePays($query, $paysId)
    {
        return $query->where('pays_id', $paysId);
    }
}

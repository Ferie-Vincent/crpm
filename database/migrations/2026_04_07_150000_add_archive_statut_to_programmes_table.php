<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // PostgreSQL : on recrée la contrainte CHECK avec la nouvelle valeur 'archive'
        DB::statement("ALTER TABLE programmes DROP CONSTRAINT IF EXISTS programmes_statut_check");
        DB::statement("ALTER TABLE programmes ADD CONSTRAINT programmes_statut_check CHECK (statut IN ('actif','cloture','suspendu','archive'))");
    }

    public function down(): void
    {
        DB::statement("UPDATE programmes SET statut = 'cloture' WHERE statut = 'archive'");
        DB::statement("ALTER TABLE programmes DROP CONSTRAINT IF EXISTS programmes_statut_check");
        DB::statement("ALTER TABLE programmes ADD CONSTRAINT programmes_statut_check CHECK (statut IN ('actif','cloture','suspendu'))");
    }
};

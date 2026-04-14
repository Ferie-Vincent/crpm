<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE programmes MODIFY COLUMN statut ENUM('actif','cloture','suspendu','archive') NOT NULL DEFAULT 'actif'");
    }

    public function down(): void
    {
        DB::statement("UPDATE programmes SET statut = 'cloture' WHERE statut = 'archive'");
        DB::statement("ALTER TABLE programmes MODIFY COLUMN statut ENUM('actif','cloture','suspendu') NOT NULL DEFAULT 'actif'");
    }
};

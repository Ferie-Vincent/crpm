<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('rapports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pays_id')->constrained('pays')->cascadeOnDelete();
            $table->foreignId('created_by')->constrained('users');
            $table->string('titre');
            $table->enum('template', ['SCAC', 'AFD', 'UE', 'generique'])->default('generique');
            $table->enum('format', ['pdf', 'excel'])->default('pdf');
            $table->date('periode_debut')->nullable();
            $table->date('periode_fin')->nullable();
            $table->json('sections')->nullable(); // selected sections checklist
            $table->enum('statut', ['en_generation', 'pret', 'erreur'])->default('en_generation');
            $table->string('fichier_path')->nullable();
            $table->timestamps();

            $table->index(['pays_id', 'created_by']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rapports');
    }
};

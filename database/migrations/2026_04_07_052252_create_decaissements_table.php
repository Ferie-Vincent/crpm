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
        Schema::create('decaissements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('projet_id')->constrained('projets')->cascadeOnDelete();
            $table->foreignId('created_by')->constrained('users');
            $table->date('date_decaissement');
            $table->decimal('montant', 15, 2);
            $table->string('reference')->nullable();
            $table->string('objet')->nullable();
            $table->enum('statut', ['prevu', 'effectue', 'annule'])->default('effectue');
            $table->string('justificatif_path')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('projet_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('decaissements');
    }
};

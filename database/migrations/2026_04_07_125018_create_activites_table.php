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
        Schema::create('activites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('projet_id')->constrained()->cascadeOnDelete();
            $table->foreignId('phase_id')->nullable()->constrained('phases')->nullOnDelete();
            $table->string('nom');
            $table->text('description')->nullable();
            $table->string('responsable')->nullable();
            $table->date('date_debut')->nullable();
            $table->date('date_fin_prevue')->nullable();
            $table->date('date_fin_reelle')->nullable();
            $table->enum('statut', ['planifie', 'en_cours', 'complete', 'annule'])->default('planifie');
            $table->unsignedTinyInteger('progression')->default(0); // 0–100 %
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activites');
    }
};

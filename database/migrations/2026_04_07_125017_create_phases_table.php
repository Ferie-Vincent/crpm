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
        Schema::create('phases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('projet_id')->constrained()->cascadeOnDelete();
            $table->string('nom');
            $table->text('description')->nullable();
            $table->unsignedTinyInteger('ordre')->default(0);
            $table->enum('statut', ['planifie', 'en_cours', 'complete', 'reporte'])->default('planifie');
            $table->date('date_debut')->nullable();
            $table->date('date_fin')->nullable();
            $table->date('date_fin_reelle')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('phases');
    }
};

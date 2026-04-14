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
        Schema::create('beneficiaires', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pays_id')->constrained('pays')->cascadeOnDelete();
            $table->foreignId('projet_id')->nullable()->constrained('projets')->nullOnDelete();
            $table->string('nom');
            $table->string('prenom')->nullable();
            $table->enum('genre', ['M', 'F', 'autre'])->nullable();
            $table->string('telephone')->nullable();
            $table->string('commune')->nullable();
            $table->string('village')->nullable();
            $table->string('activite_principale')->nullable();
            $table->json('meta')->nullable(); // additional Excel columns
            $table->timestamps();

            $table->index('pays_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('beneficiaires');
    }
};

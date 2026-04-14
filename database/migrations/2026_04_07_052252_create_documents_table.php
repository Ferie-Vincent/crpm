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
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->morphs('documentable'); // polymorphic: projet, mission_terrain, etc.
            $table->foreignId('uploaded_by')->constrained('users');
            $table->string('nom_original');
            $table->string('chemin');
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('taille')->nullable(); // bytes
            $table->string('categorie')->nullable(); // convention, rapport, photo, etc.
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};

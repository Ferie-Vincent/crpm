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
        Schema::create('missions_terrain', function (Blueprint $table) {
            $table->id();
            $table->foreignId('projet_id')->constrained('projets')->cascadeOnDelete();
            $table->foreignId('agent_id')->constrained('users');
            $table->date('date_visite');
            $table->text('observations')->nullable();
            $table->text('points_positifs')->nullable();
            $table->text('points_negatifs')->nullable();
            $table->text('recommandations')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->enum('statut', ['brouillon', 'soumis', 'valide'])->default('brouillon');
            $table->json('photos')->nullable(); // array of stored paths
            $table->string('sync_uuid')->nullable()->unique(); // for offline sync deduplication
            $table->timestamps();

            $table->index(['projet_id', 'agent_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('missions_terrain');
    }
};

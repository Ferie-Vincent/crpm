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
        Schema::create('projets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pays_id')->constrained('pays')->cascadeOnDelete();
            $table->foreignId('programme_id')->nullable()->constrained('programmes')->nullOnDelete();
            $table->string('code')->unique();
            $table->string('titre');
            $table->text('description')->nullable();
            $table->string('porteur')->nullable();
            $table->string('commune')->nullable();
            $table->string('region')->nullable();
            $table->decimal('montant_accorde', 15, 2)->nullable();
            $table->decimal('montant_decaisse', 15, 2)->default(0);
            $table->date('date_debut')->nullable();
            $table->date('date_fin_prevue')->nullable();
            $table->date('date_fin_reelle')->nullable();
            $table->enum('statut', ['en_preparation', 'en_cours', 'suspendu', 'termine', 'annule'])->default('en_preparation');
            $table->unsignedTinyInteger('completude')->default(0); // 0-100%
            $table->json('meta')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['pays_id', 'statut']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projets');
    }
};

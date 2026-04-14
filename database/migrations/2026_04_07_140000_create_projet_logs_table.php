<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projet_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('projet_id')->constrained('projets')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('type', 50); // modification, decaissement, phase, activite, document, mission
            $table->string('description');
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['projet_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projet_logs');
    }
};

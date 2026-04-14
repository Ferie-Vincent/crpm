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
        Schema::create('parametres', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pays_id')->nullable()->constrained('pays')->cascadeOnDelete();
            $table->string('cle')->index();
            $table->text('valeur')->nullable();
            $table->string('type', 20)->default('string'); // string, integer, boolean, json
            $table->timestamps();

            $table->unique(['pays_id', 'cle']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parametres');
    }
};

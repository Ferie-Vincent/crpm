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
        Schema::create('programme_pays', function (Blueprint $table) {
            $table->foreignId('programme_id')->constrained()->cascadeOnDelete();
            $table->foreignId('pays_id')->constrained('pays')->cascadeOnDelete();
            $table->primary(['programme_id', 'pays_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('programme_pays');
    }
};

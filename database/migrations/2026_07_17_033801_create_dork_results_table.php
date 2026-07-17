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
        Schema::create('dork_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dork_id')->constrained()->cascadeOnDelete();
            $table->string('url', 2048);
            $table->string('url_hash', 32);
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();

            $table->unique(['dork_id', 'url_hash']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dork_results');
    }
};

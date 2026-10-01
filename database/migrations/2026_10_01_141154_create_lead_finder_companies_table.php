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
        Schema::create('lead_finder_companies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lead_finder_segment_id')->constrained()->cascadeOnDelete();
            $table->string('source', 16); // map, paste, csv
            $table->string('name')->nullable();
            $table->string('website');
            $table->string('domain'); // normalized host (lowercase, no "www."), used to dedupe
            $table->string('location')->nullable();
            $table->string('country')->nullable();
            $table->string('email')->nullable();
            $table->string('contact_name')->nullable();
            $table->string('contact_title')->nullable();
            $table->timestamps();

            $table->unique(['lead_finder_segment_id', 'domain']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lead_finder_companies');
    }
};

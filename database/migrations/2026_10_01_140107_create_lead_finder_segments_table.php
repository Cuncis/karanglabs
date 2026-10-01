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
        Schema::create('lead_finder_segments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lead_finder_project_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('pain')->nullable();
            $table->text('offer_angle')->nullable();
            $table->json('criteria')->nullable(); // exactly 3 yes/no questions
            $table->json('search_filters')->nullable(); // {industry: [], keywords: []}
            $table->json('example_company_types')->nullable();
            $table->unsignedTinyInteger('fit_score')->nullable(); // 0-100
            $table->text('fit_reason')->nullable();
            $table->string('estimated_size')->nullable();
            $table->boolean('is_enabled')->default(true); // user's on/off switch
            $table->string('status', 32)->default('active'); // active, retired
            // Maintained by the company-finding feature; used here to decide
            // whether a segment the AI no longer proposes can be retired.
            $table->unsignedInteger('companies_count')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lead_finder_segments');
    }
};

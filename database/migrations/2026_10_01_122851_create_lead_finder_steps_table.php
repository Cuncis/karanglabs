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
        Schema::create('lead_finder_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lead_finder_project_id')->constrained()->cascadeOnDelete();
            $table->string('step', 64); // 'fetch_profile', later: 'segments', 'companies'
            $table->string('status', 32)->default('pending'); // pending, running, completed, failed
            $table->string('failure_reason')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['lead_finder_project_id', 'step']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lead_finder_steps');
    }
};

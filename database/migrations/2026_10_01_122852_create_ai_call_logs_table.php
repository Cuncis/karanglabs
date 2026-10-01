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
        Schema::create('ai_call_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('lead_finder_project_id')->nullable()->constrained()->nullOnDelete();
            $table->string('step', 64)->nullable();
            $table->string('model');
            $table->longText('prompt');
            $table->longText('response')->nullable();
            $table->unsignedInteger('input_tokens')->nullable();
            $table->unsignedInteger('output_tokens')->nullable();
            $table->decimal('cost_usd', 8, 4)->nullable();
            $table->unsignedInteger('latency_ms')->nullable();
            $table->string('status', 32); // succeeded, failed
            $table->string('error_message')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_call_logs');
    }
};

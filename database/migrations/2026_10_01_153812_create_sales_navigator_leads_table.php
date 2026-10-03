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
        Schema::create('sales_navigator_leads', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('title')->nullable();
            $table->string('company')->nullable();
            $table->string('company_url')->nullable();
            $table->string('location')->nullable();
            $table->string('profile_url')->unique(); // LinkedIn Sales Navigator lead URL, dedupe key
            $table->string('connection_degree', 8)->nullable(); // '1st', '2nd', '3rd'
            $table->text('about')->nullable();
            $table->string('status', 32)->default('not_contacted');
            // not_contacted, connected_no_response, replied, deal
            $table->text('notes')->nullable();
            $table->timestamp('last_contacted_at')->nullable();
            $table->foreignId('added_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales_navigator_leads');
    }
};

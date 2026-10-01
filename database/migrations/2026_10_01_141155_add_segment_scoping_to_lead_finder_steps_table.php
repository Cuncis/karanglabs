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
        // A step can now belong to a specific segment (e.g. "find companies for
        // this segment on the map"), not just the project as a whole. Null means
        // it's a project-level step, same as before this migration.
        Schema::table('lead_finder_steps', function (Blueprint $table) {
            $table->foreignId('lead_finder_segment_id')->nullable()->after('lead_finder_project_id')->constrained()->cascadeOnDelete();
            $table->string('note')->nullable()->after('failure_reason');
        });

        Schema::table('lead_finder_steps', function (Blueprint $table) {
            $table->dropUnique(['lead_finder_project_id', 'step']);
            $table->unique(['lead_finder_project_id', 'lead_finder_segment_id', 'step']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lead_finder_steps', function (Blueprint $table) {
            $table->dropUnique(['lead_finder_project_id', 'lead_finder_segment_id', 'step']);
            $table->unique(['lead_finder_project_id', 'step']);
            $table->dropConstrainedForeignId('lead_finder_segment_id');
            $table->dropColumn('note');
        });
    }
};

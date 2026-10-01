<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The default auto-generated name for the 3-column unique index below
     * would be 77 characters ("lead_finder_steps_lead_finder_project_id_lead_
     * finder_segment_id_step_unique"), over MySQL's 64-character identifier
     * limit. SQLite doesn't enforce that limit, which is how this slipped
     * through locally. Naming it explicitly keeps it well under the limit
     * and gives up()/down() a stable name to agree on.
     */
    private const NEW_UNIQUE_INDEX = 'lead_finder_steps_project_segment_step_unique';

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // A step can now belong to a specific segment (e.g. "find companies for
        // this segment on the map"), not just the project as a whole. Null means
        // it's a project-level step, same as before this migration.
        //
        // Column adds are guarded with hasColumn() so this migration can finish
        // cleanly if it's re-run after a partial failure (see the index notes
        // below for why that can happen on MySQL).
        Schema::table('lead_finder_steps', function (Blueprint $table) {
            if (! Schema::hasColumn('lead_finder_steps', 'lead_finder_segment_id')) {
                $table->foreignId('lead_finder_segment_id')->nullable()->after('lead_finder_project_id')->constrained()->cascadeOnDelete();
            }
            if (! Schema::hasColumn('lead_finder_steps', 'note')) {
                $table->string('note')->nullable()->after('failure_reason');
            }
        });

        // On MySQL/InnoDB, the original (project_id, step) unique index is the
        // only index covering lead_finder_project_id, so it's also what backs
        // that column's foreign key. InnoDB refuses to drop an index that's
        // still needed to back a foreign key, so the new index (which also
        // starts with lead_finder_project_id, and so can take over as the FK's
        // backing index) has to be created FIRST, before the old one is dropped.
        // Doing it in the other order works on SQLite but fails on MySQL.
        if (! $this->hasIndex('lead_finder_steps', self::NEW_UNIQUE_INDEX)) {
            Schema::table('lead_finder_steps', function (Blueprint $table) {
                $table->unique(['lead_finder_project_id', 'lead_finder_segment_id', 'step'], self::NEW_UNIQUE_INDEX);
            });
        }

        if ($this->hasIndex('lead_finder_steps', 'lead_finder_steps_lead_finder_project_id_step_unique')) {
            Schema::table('lead_finder_steps', function (Blueprint $table) {
                $table->dropUnique(['lead_finder_project_id', 'step']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Same ordering reason as up(): recreate the old index before dropping
        // the new one, so lead_finder_project_id's foreign key always has a
        // valid backing index.
        Schema::table('lead_finder_steps', function (Blueprint $table) {
            $table->unique(['lead_finder_project_id', 'step']);
        });

        Schema::table('lead_finder_steps', function (Blueprint $table) {
            $table->dropUnique(self::NEW_UNIQUE_INDEX);
            $table->dropConstrainedForeignId('lead_finder_segment_id');
            $table->dropColumn('note');
        });
    }

    private function hasIndex(string $table, string $indexName): bool
    {
        return collect(Schema::getIndexes($table))->contains('name', $indexName);
    }
};

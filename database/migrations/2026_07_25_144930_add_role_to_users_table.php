<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add a single role column (admin | reseller | member) and fold the old
     * is_reseller flag into it.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role', 32)->default('member')->after('has_studio_access');
        });

        DB::table('users')->where('is_reseller', true)->update(['role' => 'reseller']);

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('is_reseller');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_reseller')->default(false)->after('has_studio_access');
        });

        DB::table('users')->where('role', 'reseller')->update(['is_reseller' => true]);

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};

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
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->string('email');
            $table->string('name')->nullable();
            $table->string('phone')->nullable();
            $table->string('tier', 32); // 'tools' or 'bundle'
            $table->string('status', 32)->default('pending'); // pending, active, stopped, expired
            $table->string('mayar_member_id')->nullable()->unique();
            $table->string('mayar_product_id')->nullable();
            $table->timestamp('next_payment_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('forum_memberships')) {
            return;
        }

        Schema::create('forum_memberships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('forum_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('email')->nullable();
            $table->string('status', 24)->default('pending');
            $table->foreignId('invited_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();

            $table->unique(['forum_id', 'user_id']);
            $table->index(['forum_id', 'email']);
            $table->index(['forum_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('forum_memberships');
    }
};

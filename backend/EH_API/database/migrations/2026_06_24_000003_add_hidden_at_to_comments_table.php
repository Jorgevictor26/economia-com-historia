<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('comments', 'hidden_at')) {
            Schema::table('comments', function (Blueprint $table) {
                $table->timestamp('hidden_at')->nullable()->after('comment');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('comments', 'hidden_at')) {
            Schema::table('comments', function (Blueprint $table) {
                $table->dropColumn('hidden_at');
            });
        }
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('forums', function (Blueprint $table) {
            if (! Schema::hasColumn('forums', 'access_code')) {
                $table->string('access_code', 24)->nullable()->unique()->after('visibility');
            }

            if (! Schema::hasColumn('forums', 'join_approval_required')) {
                $table->boolean('join_approval_required')->default(false)->after('access_code');
            }
        });
    }

    public function down(): void
    {
        Schema::table('forums', function (Blueprint $table) {
            if (Schema::hasColumn('forums', 'join_approval_required')) {
                $table->dropColumn('join_approval_required');
            }

            if (Schema::hasColumn('forums', 'access_code')) {
                $table->dropUnique(['access_code']);
                $table->dropColumn('access_code');
            }
        });
    }
};

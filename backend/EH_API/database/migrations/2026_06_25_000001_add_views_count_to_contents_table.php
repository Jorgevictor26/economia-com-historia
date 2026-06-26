<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contents', function (Blueprint $table) {
            if (! Schema::hasColumn('contents', 'views_count')) {
                $table->unsignedBigInteger('views_count')->default(0)->after('visibility');
            }
        });
    }

    public function down(): void
    {
        Schema::table('contents', function (Blueprint $table) {
            if (Schema::hasColumn('contents', 'views_count')) {
                $table->dropColumn('views_count');
            }
        });
    }
};

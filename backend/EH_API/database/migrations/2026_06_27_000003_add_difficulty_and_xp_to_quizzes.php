<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            $table->string('difficulty')->default('medio')->after('description');
            $table->unsignedInteger('xp_per_question')->default(15)->after('difficulty');
        });

        Schema::table('quiz_results', function (Blueprint $table) {
            $table->unsignedInteger('earned_xp')->default(0)->after('percentage');
        });
    }

    public function down(): void
    {
        Schema::table('quiz_results', function (Blueprint $table) {
            $table->dropColumn('earned_xp');
        });

        Schema::table('quizzes', function (Blueprint $table) {
            $table->dropColumn(['difficulty', 'xp_per_question']);
        });
    }
};

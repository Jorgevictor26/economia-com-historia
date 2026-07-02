<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quiz_results', function (Blueprint $table) {
            if (! Schema::hasColumn('quiz_results', 'correct_answers')) {
                $table->unsignedTinyInteger('correct_answers')->default(0)->after('total_questions');
            }

            if (! Schema::hasColumn('quiz_results', 'wrong_answers')) {
                $table->unsignedTinyInteger('wrong_answers')->default(0)->after('correct_answers');
            }

            if (! Schema::hasColumn('quiz_results', 'duration_seconds')) {
                $table->unsignedInteger('duration_seconds')->default(0)->after('earned_xp');
            }

            if (! Schema::hasColumn('quiz_results', 'is_best')) {
                $table->boolean('is_best')->default(false)->after('duration_seconds');
            }
        });

        Schema::table('quiz_answers', function (Blueprint $table) {
            if (! Schema::hasColumn('quiz_answers', 'quiz_result_id')) {
                $table->foreignId('quiz_result_id')
                    ->nullable()
                    ->after('id')
                    ->constrained('quiz_results')
                    ->cascadeOnDelete();
            }
        });

        Schema::table('quiz_progresses', function (Blueprint $table) {
            if (! Schema::hasColumn('quiz_progresses', 'correct_count')) {
                $table->unsignedTinyInteger('correct_count')->default(0)->after('current_question_index');
            }

            if (! Schema::hasColumn('quiz_progresses', 'elapsed_seconds')) {
                $table->unsignedInteger('elapsed_seconds')->default(0)->after('correct_count');
            }

            if (! Schema::hasColumn('quiz_progresses', 'question_order')) {
                $table->json('question_order')->nullable()->after('answered_questions');
            }
        });

        if (! Schema::hasTable('user_achievements')) {
            Schema::create('user_achievements', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->string('code');
                $table->string('name');
                $table->string('level')->nullable();
                $table->timestamp('earned_at')->useCurrent();
                $table->timestamps();

                $table->unique(['user_id', 'code']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('user_achievements');

        Schema::table('quiz_progresses', function (Blueprint $table) {
            foreach (['question_order', 'elapsed_seconds', 'correct_count'] as $column) {
                if (Schema::hasColumn('quiz_progresses', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::table('quiz_answers', function (Blueprint $table) {
            if (Schema::hasColumn('quiz_answers', 'quiz_result_id')) {
                $table->dropConstrainedForeignId('quiz_result_id');
            }
        });

        Schema::table('quiz_results', function (Blueprint $table) {
            foreach (['is_best', 'duration_seconds', 'wrong_answers', 'correct_answers'] as $column) {
                if (Schema::hasColumn('quiz_results', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};

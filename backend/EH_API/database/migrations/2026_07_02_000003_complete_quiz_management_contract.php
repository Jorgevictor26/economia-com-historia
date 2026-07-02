<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            if (! Schema::hasColumn('quizzes', 'category_id')) {
                $table->foreignId('category_id')
                    ->nullable()
                    ->after('content_id')
                    ->constrained()
                    ->nullOnDelete();
            }

            if (! Schema::hasColumn('quizzes', 'status')) {
                $table->string('status', 20)->default('active')->after('description');
            }
        });

        Schema::table('questions', function (Blueprint $table) {
            if (! Schema::hasColumn('questions', 'order')) {
                $table->unsignedSmallInteger('order')->default(1)->after('question');
            }
        });

        if (! Schema::hasTable('quiz_alternatives')) {
            Schema::create('quiz_alternatives', function (Blueprint $table) {
                $table->id();
                $table->foreignId('question_id')->constrained('questions')->cascadeOnDelete();
                $table->string('text');
                $table->boolean('is_correct')->default(false);
                $table->timestamps();
            });

            DB::table('questions')
                ->orderBy('id')
                ->get()
                ->each(function (object $question): void {
                    foreach (['a', 'b', 'c', 'd'] as $option) {
                        $text = $question->{'option_'.$option} ?? null;

                        if ($text === null || $text === '') {
                            continue;
                        }

                        DB::table('quiz_alternatives')->insert([
                            'question_id' => $question->id,
                            'text' => $text,
                            'is_correct' => ($question->correct_option ?? null) === $option,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                });
        }

        Schema::table('quiz_answers', function (Blueprint $table) {
            if (! Schema::hasColumn('quiz_answers', 'quiz_alternative_id')) {
                $table->foreignId('quiz_alternative_id')
                    ->nullable()
                    ->after('question_id')
                    ->constrained('quiz_alternatives')
                    ->nullOnDelete();
            }

            if (! Schema::hasColumn('quiz_answers', 'elapsed_seconds')) {
                $table->unsignedInteger('elapsed_seconds')->default(0)->after('is_correct');
            }
        });

        Schema::table('quiz_progresses', function (Blueprint $table) {
            if (! Schema::hasColumn('quiz_progresses', 'started_at')) {
                $table->timestamp('started_at')->nullable()->after('quiz_id');
            }
        });

        if (! Schema::hasTable('quiz_rankings')) {
            Schema::create('quiz_rankings', function (Blueprint $table) {
                $table->id();
                $table->foreignId('quiz_result_id')->constrained('quiz_results')->cascadeOnDelete();
                $table->foreignId('quiz_id')->constrained('quizzes')->cascadeOnDelete();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->unsignedInteger('score');
                $table->unsignedInteger('earned_xp');
                $table->unsignedInteger('duration_seconds');
                $table->timestamp('completed_at');
                $table->timestamps();

                $table->unique(['quiz_id', 'user_id']);
            });
        }

        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'total_xp')) {
                $table->unsignedInteger('total_xp')->default(0)->after('status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'total_xp')) {
                $table->dropColumn('total_xp');
            }
        });

        Schema::dropIfExists('quiz_rankings');

        Schema::table('quiz_progresses', function (Blueprint $table) {
            if (Schema::hasColumn('quiz_progresses', 'started_at')) {
                $table->dropColumn('started_at');
            }
        });

        Schema::table('quiz_answers', function (Blueprint $table) {
            if (Schema::hasColumn('quiz_answers', 'quiz_alternative_id')) {
                $table->dropConstrainedForeignId('quiz_alternative_id');
            }

            if (Schema::hasColumn('quiz_answers', 'elapsed_seconds')) {
                $table->dropColumn('elapsed_seconds');
            }
        });

        Schema::dropIfExists('quiz_alternatives');

        Schema::table('questions', function (Blueprint $table) {
            if (Schema::hasColumn('questions', 'order')) {
                $table->dropColumn('order');
            }
        });

        Schema::table('quizzes', function (Blueprint $table) {
            if (Schema::hasColumn('quizzes', 'category_id')) {
                $table->dropConstrainedForeignId('category_id');
            }

            if (Schema::hasColumn('quizzes', 'status')) {
                $table->dropColumn('status');
            }
        });
    }
};

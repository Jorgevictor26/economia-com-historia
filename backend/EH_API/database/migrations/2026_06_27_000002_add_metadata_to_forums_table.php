<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('forums', function (Blueprint $table) {
            if (! Schema::hasColumn('forums', 'rules')) {
                $table->text('rules')->nullable()->after('description');
            }

            if (! Schema::hasColumn('forums', 'category')) {
                $table->string('category')->nullable()->after('rules');
            }

            if (! Schema::hasColumn('forums', 'image_url')) {
                $table->longText('image_url')->nullable()->after('category');
            }

            if (! Schema::hasColumn('forums', 'visibility')) {
                $table->enum('visibility', ['public', 'private'])->default('public')->after('image_url');
            }

            if (! Schema::hasColumn('forums', 'content_permission')) {
                $table->enum('content_permission', ['public', 'subscribers'])->default('public')->after('visibility');
            }

            if (! Schema::hasColumn('forums', 'allow_attachments')) {
                $table->boolean('allow_attachments')->default(false)->after('content_permission');
            }
        });

        if (! Schema::hasTable('content_forum')) {
            Schema::create('content_forum', function (Blueprint $table) {
                $table->id();
                $table->foreignId('forum_id')->constrained('forums')->cascadeOnDelete();
                $table->foreignId('content_id')->constrained('contents')->cascadeOnDelete();
                $table->timestamps();
                $table->unique(['forum_id', 'content_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('content_forum');

        Schema::table('forums', function (Blueprint $table) {
            foreach ([
                'allow_attachments',
                'content_permission',
                'visibility',
                'image_url',
                'category',
                'rules',
            ] as $column) {
                if (Schema::hasColumn('forums', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};

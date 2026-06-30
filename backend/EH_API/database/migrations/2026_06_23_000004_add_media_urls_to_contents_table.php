<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contents', function (Blueprint $table) {
            $table->string('image_url')->nullable()->after('content');
            $table->string('video_url')->nullable()->after('image_url');
            $table->string('audio_url')->nullable()->after('video_url');
            $table->string('document_url')->nullable()->after('audio_url');
        });
    }

    public function down(): void
    {
        Schema::table('contents', function (Blueprint $table) {
            $table->dropColumn([
                'image_url',
                'video_url',
                'audio_url',
                'document_url',
            ]);
        });
    }
};

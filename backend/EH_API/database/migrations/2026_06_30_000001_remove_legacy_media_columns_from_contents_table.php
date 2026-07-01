<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('contents', 'image') && Schema::hasColumn('contents', 'image_url')) {
            DB::table('contents')
                ->whereNull('image_url')
                ->whereNotNull('image')
                ->update(['image_url' => DB::raw('image')]);
        }

        if (Schema::hasColumn('contents', 'video') && Schema::hasColumn('contents', 'video_url')) {
            DB::table('contents')
                ->whereNull('video_url')
                ->whereNotNull('video')
                ->update(['video_url' => DB::raw('video')]);
        }

        Schema::table('contents', function (Blueprint $table) {
            if (Schema::hasColumn('contents', 'image')) {
                $table->dropColumn('image');
            }

            if (Schema::hasColumn('contents', 'video')) {
                $table->dropColumn('video');
            }
        });
    }

    public function down(): void
    {
        Schema::table('contents', function (Blueprint $table) {
            if (! Schema::hasColumn('contents', 'image')) {
                $table->string('image')->nullable()->after('content');
            }

            if (! Schema::hasColumn('contents', 'video')) {
                $table->string('video')->nullable()->after('image');
            }
        });

        if (Schema::hasColumn('contents', 'image') && Schema::hasColumn('contents', 'image_url')) {
            DB::table('contents')
                ->whereNull('image')
                ->whereNotNull('image_url')
                ->update(['image' => DB::raw('image_url')]);
        }

        if (Schema::hasColumn('contents', 'video') && Schema::hasColumn('contents', 'video_url')) {
            DB::table('contents')
                ->whereNull('video')
                ->whereNotNull('video_url')
                ->update(['video' => DB::raw('video_url')]);
        }
    }
};

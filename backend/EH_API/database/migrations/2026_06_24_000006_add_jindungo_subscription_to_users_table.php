<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'jindungo_subscription_expires_at')) {
            Schema::table('users', function (Blueprint $table) {
                $table->timestamp('jindungo_subscription_expires_at')
                    ->nullable()
                    ->after('status');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('users', 'jindungo_subscription_expires_at')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('jindungo_subscription_expires_at');
            });
        }
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            if (! Schema::hasColumn('users', 'jindungo_subscription_requested_at')) {
                $table->timestamp('jindungo_subscription_requested_at')->nullable()->after('jindungo_subscription_expires_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            if (Schema::hasColumn('users', 'jindungo_subscription_requested_at')) {
                $table->dropColumn('jindungo_subscription_requested_at');
            }
        });
    }
};

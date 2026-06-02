<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('restaurants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('name', 255);
            $table->string('slug', 255)->unique();
            $table->text('description')->nullable();
            $table->string('image_url', 500)->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('email', 255)->nullable();
            $table->string('address', 500);
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->string('cuisine_type', 100)->nullable();
            $table->string('price_range', 10)->default('$$');
            $table->decimal('delivery_fee', 8, 2)->default(0.00);
            $table->decimal('minimum_order', 8, 2)->default(0.00);
            $table->integer('estimated_delivery_minutes')->default(30);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->time('opens_at')->nullable();
            $table->time('closes_at')->nullable();
            $table->decimal('rating', 3, 2)->default(0.00);
            $table->integer('rating_count')->default(0);
            $table->integer('total_orders')->default(0);
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->index(['tenant_id', 'is_active']);
            $table->index(['latitude', 'longitude']);
            $table->index('cuisine_type');
            $table->index('is_featured');
        });

        Schema::create('restaurant_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('restaurant_id');
            $table->string('name', 100);
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('restaurant_id')->references('id')->on('restaurants')->onDelete('cascade');
            $table->index(['restaurant_id', 'is_active']);
        });

        Schema::create('menu_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('restaurant_id');
            $table->uuid('category_id')->nullable();
            $table->string('name', 255);
            $table->text('description')->nullable();
            $table->decimal('price', 8, 2);
            $table->string('image_url', 500)->nullable();
            $table->boolean('is_available')->default(true);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_vegetarian')->default(false);
            $table->boolean('is_vegan')->default(false);
            $table->boolean('is_gluten_free')->default(false);
            $table->integer('spice_level')->default(0);
            $table->integer('preparation_time_minutes')->nullable();
            $table->integer('calories')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->foreign('restaurant_id')->references('id')->on('restaurants')->onDelete('cascade');
            $table->foreign('category_id')->references('id')->on('restaurant_categories')->onDelete('set null');
            $table->index(['restaurant_id', 'is_active', 'is_available']);
            $table->index('category_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menu_items');
        Schema::dropIfExists('restaurant_categories');
        Schema::dropIfExists('restaurants');
    }
};

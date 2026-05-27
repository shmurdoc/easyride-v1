<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Tenant;
use App\Models\SystemSetting;
use App\Models\Wallet;
use App\Models\DriverProfile;
use App\Models\Vehicle;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create permissions
        $permissions = ['view-dashboard', 'manage-users', 'manage-rides', 'manage-drivers',
            'manage-payments', 'manage-promotions', 'manage-deliveries', 'manage-settings'];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'api']);
        }

        // Create roles and assign permissions
        $superAdmin = Role::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);
        $superAdmin->syncPermissions(Permission::all()->where('guard_name', 'web'));

        $superAdminApi = Role::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'api']);
        $superAdminApi->syncPermissions(Permission::all()->where('guard_name', 'api'));

        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $admin->syncPermissions(Permission::all()->where('guard_name', 'web'));

        $adminApi = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'api']);
        $adminApi->syncPermissions(Permission::all()->where('guard_name', 'api'));

        Role::firstOrCreate(['name' => 'driver', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'driver', 'guard_name' => 'api']);
        Role::firstOrCreate(['name' => 'rider', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'rider', 'guard_name' => 'api']);

        // Create default tenant
        $tenant = Tenant::firstOrCreate(
            ['slug' => 'default'],
            ['name' => 'Default Tenant', 'region' => 'ZA', 'currency' => 'ZAR', 'is_active' => true]
        );

        // Create admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@easyryde.com'],
            [
                'tenant_id' => $tenant->id,
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'phone_number' => '+27123456789',
                'role' => 'admin',
                'is_active' => true,
            ]
        );
        $admin->assignRole('super-admin');

        // Create driver user
        $driver = User::firstOrCreate(
            ['email' => 'driver@easyryde.com'],
            [
                'tenant_id' => $tenant->id,
                'name' => 'John Driver',
                'password' => Hash::make('password'),
                'phone_number' => '+27234567890',
                'role' => 'driver',
                'is_active' => true,
                'is_online' => false,
            ]
        );
        $driver->assignRole('driver');

        DriverProfile::firstOrCreate(
            ['user_id' => $driver->id],
            [
                'license_number' => 'LIC-12345',
                'license_expiry' => '2028-12-31',
                'is_verified' => true,
                'is_approved' => true,
            ]
        );

        Vehicle::firstOrCreate(
            ['user_id' => $driver->id],
            [
                'make' => 'Toyota',
                'model' => 'Corolla',
                'year' => 2023,
                'color' => 'White',
                'license_plate' => 'CA-123-456',
                'category' => 'standard',
                'is_active' => true,
            ]
        );

        // Create rider user
        $rider = User::firstOrCreate(
            ['email' => 'rider@easyryde.com'],
            [
                'tenant_id' => $tenant->id,
                'name' => 'Jane Rider',
                'password' => Hash::make('password'),
                'phone_number' => '+27345678901',
                'role' => 'rider',
                'is_active' => true,
            ]
        );
        $rider->assignRole('rider');

        // Create wallets
        Wallet::firstOrCreate(
            ['user_id' => $driver->id],
            ['balance' => 0, 'pending_balance' => 0, 'currency' => 'ZAR']
        );
        Wallet::firstOrCreate(
            ['user_id' => $rider->id],
            ['balance' => 500, 'pending_balance' => 0, 'currency' => 'ZAR']
        );
        Wallet::firstOrCreate(
            ['user_id' => $admin->id],
            ['balance' => 0, 'pending_balance' => 0, 'currency' => 'ZAR']
        );

        // Create system settings
        $settings = [
            ['app_name', 'EasyRyde', 'text', 'Application name'],
            ['fare_economy_base', '25', 'number', 'Base fare for economy rides'],
            ['fare_economy_per_km', '12', 'number', 'Per km rate for economy'],
            ['fare_economy_per_min', '2', 'number', 'Per minute rate for economy'],
            ['fare_economy_minimum', '35', 'number', 'Minimum fare for economy'],
            ['fare_standard_base', '35', 'number', 'Base fare for standard rides'],
            ['fare_standard_per_km', '15', 'number', 'Per km rate for standard'],
            ['fare_standard_per_min', '3', 'number', 'Per minute rate for standard'],
            ['fare_standard_minimum', '50', 'number', 'Minimum fare for standard'],
            ['fare_premium_base', '55', 'number', 'Base fare for premium rides'],
            ['fare_premium_per_km', '22', 'number', 'Per km rate for premium'],
            ['fare_premium_per_min', '5', 'number', 'Per minute rate for premium'],
            ['fare_premium_minimum', '80', 'number', 'Minimum fare for premium'],
            ['fare_delivery_base', '20', 'number', 'Base fare for deliveries'],
            ['fare_delivery_per_km', '10', 'number', 'Per km rate for delivery'],
            ['fare_delivery_per_min', '1', 'number', 'Per minute rate for delivery'],
            ['fare_delivery_minimum', '30', 'number', 'Minimum fare for delivery'],
            ['platform_fee_percent', '15', 'number', 'Platform fee percentage'],
            ['driver_search_radius', '5', 'number', 'Default driver search radius in km'],
            ['max_surge_multiplier', '2.5', 'number', 'Maximum surge pricing multiplier'],
        ];

        foreach ($settings as [$key, $value, $type, $description]) {
            SystemSetting::firstOrCreate(
                ['key' => $key, 'tenant_id' => $tenant->id],
                ['value' => $value, 'type' => $type, 'description' => $description]
            );
        }
    }
}

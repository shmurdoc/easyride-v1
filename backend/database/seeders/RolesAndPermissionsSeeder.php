<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        Permission::create(['name' => 'manage users']);
        Permission::create(['name' => 'manage drivers']);
        Permission::create(['name' => 'manage rides']);
        Permission::create(['name' => 'manage payments']);
        Permission::create(['name' => 'manage settings']);
        Permission::create(['name' => 'view reports']);
        Permission::create(['name' => 'manage promo codes']);
        Permission::create(['name' => 'manage deliveries']);

        // Create roles
        $rider = Role::create(['name' => 'rider']);
        $driver = Role::create(['name' => 'driver']);
        $admin = Role::create(['name' => 'admin']);
        $superAdmin = Role::create(['name' => 'super-admin']);

        // Assign permissions to roles
        $admin->givePermissionTo([
            'manage users', 'manage drivers', 'manage rides',
            'manage payments', 'manage settings', 'view reports',
            'manage promo codes', 'manage deliveries',
        ]);

        $superAdmin->givePermissionTo([
            'manage users', 'manage drivers', 'manage rides',
            'manage payments', 'manage settings', 'view reports',
            'manage promo codes', 'manage deliveries',
        ]);

        // Create default tenant
        $tenant = Tenant::firstOrCreate(
            ['slug' => 'phalaborwa'],
            [
                'name' => 'Phalaborwa',
                'is_active' => true,
            ]
        );

        // Create default admin
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@easyryde.co.za'],
            [
                'tenant_id' => $tenant->id,
                'name' => 'Admin',
                'password' => Hash::make('password'),
                'phone_number' => '+27000000000',
                'role' => 'admin',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $adminUser->assignRole('admin');

        // Create super admin
        $superAdminUser = User::firstOrCreate(
            ['email' => 'superadmin@easyryde.co.za'],
            [
                'tenant_id' => $tenant->id,
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'phone_number' => '+27000000001',
                'role' => 'super-admin',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $superAdminUser->assignRole('super-admin');

        // Create demo rider
        $rider = User::firstOrCreate(
            ['email' => 'rider@easyryde.co.za'],
            [
                'tenant_id' => $tenant->id,
                'name' => 'Demo Rider',
                'password' => Hash::make('password'),
                'phone_number' => '+27000000002',
                'role' => 'rider',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );
        $rider->assignRole('rider');

        // Create demo driver
        $driverUser = User::firstOrCreate(
            ['email' => 'driver@easyryde.co.za'],
            [
                'tenant_id' => $tenant->id,
                'name' => 'Demo Driver',
                'password' => Hash::make('password'),
                'phone_number' => '+27000000003',
                'role' => 'driver',
                'is_active' => true,
                'email_verified_at' => now(),
                'current_latitude' => -23.9470,
                'current_longitude' => 31.0830,
                'is_online' => true,
            ]
        );
        $driverUser->assignRole('driver');

        // Create driver profile for demo driver
        \App\Models\DriverProfile::firstOrCreate(
            ['user_id' => $driverUser->id],
            [
                'license_number' => 'GP12345678',
                'license_expiry' => '2028-12-31',
                'id_number' => '9001010000000',
                'is_approved' => true,
                'is_verified' => true,
                'is_online' => true,
                'average_rating' => 4.8,
                'rating_count' => 120,
                'total_trips' => 450,
                'total_earnings' => 25000.00,
                'approved_by' => $adminUser->id,
                'approved_at' => now(),
            ]
        );

        // Create vehicle for demo driver
        \App\Models\Vehicle::firstOrCreate(
            ['user_id' => $driverUser->id],
            [
                'make' => 'Toyota',
                'model' => 'Corolla',
                'year' => 2022,
                'color' => 'White',
                'license_plate' => 'GP ABC 123',
                'category' => 'standard',
            ]
        );

        // Create wallet for demo users
        \App\Models\Wallet::firstOrCreate(
            ['user_id' => $rider->id],
            ['balance' => 500.00, 'pending_balance' => 0.00, 'currency' => 'ZAR']
        );

        \App\Models\Wallet::firstOrCreate(
            ['user_id' => $driverUser->id],
            ['balance' => 250.00, 'pending_balance' => 0.00, 'currency' => 'ZAR']
        );
    }
}

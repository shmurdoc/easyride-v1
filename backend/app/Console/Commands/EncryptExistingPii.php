<?php

namespace App\Console\Commands;

use App\Models\DriverProfile;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Console\Command;

class EncryptExistingPii extends Command
{
    protected $signature = 'pii:encrypt-existing';

    protected $description = 'Encrypt existing PII data that was stored in plaintext before encryption casts were added';

    public function handle(): int
    {
        $this->info('Re-saving User models to trigger encrypted casts...');
        User::chunk(100, function ($users) {
            foreach ($users as $user) {
                $user->phone_number = $user->phone_number;
                $user->email = $user->email;
                $user->saveQuietly();
            }
        });

        $this->info('Re-saving DriverProfile models to trigger encrypted casts...');
        DriverProfile::chunk(100, function ($profiles) {
            foreach ($profiles as $profile) {
                $profile->id_number = $profile->id_number;
                $profile->license_number = $profile->license_number;
                $profile->emergency_contact_name = $profile->emergency_contact_name;
                $profile->emergency_contact_phone = $profile->emergency_contact_phone;
                $profile->saveQuietly();
            }
        });

        $this->info('Re-saving Vehicle models to trigger encrypted casts...');
        Vehicle::chunk(100, function ($vehicles) {
            foreach ($vehicles as $vehicle) {
                $vehicle->license_plate = $vehicle->license_plate;
                $vehicle->saveQuietly();
            }
        });

        $this->info('PII encryption verification complete!');

        return Command::SUCCESS;
    }
}

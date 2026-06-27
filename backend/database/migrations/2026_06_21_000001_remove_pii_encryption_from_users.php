<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $users = DB::table('users')->whereNotNull('phone_number')->get();
        foreach ($users as $user) {
            $decrypted = $this->tryDecrypt($user->phone_number);
            if ($decrypted !== null) {
                DB::table('users')->where('id', $user->id)->update([
                    'phone_number' => $decrypted,
                ]);
            }
        }

        $usersWithEmail = DB::table('users')->whereNotNull('email')->get();
        foreach ($usersWithEmail as $user) {
            $decrypted = $this->tryDecrypt($user->email);
            if ($decrypted !== null) {
                DB::table('users')->where('id', $user->id)->update([
                    'email' => $decrypted,
                ]);
            }
        }
    }

    public function down(): void
    {
        $users = DB::table('users')->whereNotNull('phone_number')->get();
        foreach ($users as $user) {
            DB::table('users')->where('id', $user->id)->update([
                'phone_number' => encrypt($user->phone_number),
            ]);
        }

        $usersWithEmail = DB::table('users')->whereNotNull('email')->get();
        foreach ($usersWithEmail as $user) {
            DB::table('users')->where('id', $user->id)->update([
                'email' => encrypt($user->email),
            ]);
        }
    }

    private function tryDecrypt(string $value): ?string
    {
        try {
            $decrypted = decrypt($value);

            return is_string($decrypted) ? $decrypted : null;
        } catch (Exception $e) {
            return null;
        }
    }
};

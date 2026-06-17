<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $users = DB::table('users')->whereNotNull('phone_number')->where('phone_number', 'not like', 'enc:%')->get();
        foreach ($users as $user) {
            DB::table('users')->where('id', $user->id)->update([
                'phone_number' => encrypt($user->phone_number),
            ]);
        }

        $usersWithEmail = DB::table('users')->whereNotNull('email')->where('email', 'not like', 'enc:%')->get();
        foreach ($usersWithEmail as $user) {
            DB::table('users')->where('id', $user->id)->update([
                'email' => encrypt($user->email),
            ]);
        }
    }

    public function down(): void
    {
        $users = DB::table('users')->whereNotNull('phone_number')->where('phone_number', 'like', 'enc:%')->get();
        foreach ($users as $user) {
            try {
                DB::table('users')->where('id', $user->id)->update([
                    'phone_number' => decrypt($user->phone_number),
                ]);
            } catch (Exception $e) {
                // Skip if can't decrypt
            }
        }

        $usersWithEmail = DB::table('users')->whereNotNull('email')->where('email', 'like', 'enc:%')->get();
        foreach ($usersWithEmail as $user) {
            try {
                DB::table('users')->where('id', $user->id)->update([
                    'email' => decrypt($user->email),
                ]);
            } catch (Exception $e) {
                // Skip if can't decrypt
            }
        }
    }
};

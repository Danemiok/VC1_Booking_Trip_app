<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password123'),
                'role' => 'admin',
            ]
        );

        User::updateOrCreate(
            ['email' => 'customer@example.com'],
            [
                'name' => 'Customer User',
                'password' => Hash::make('password123'),
                'role' => 'customer',
            ]
        );

        User::updateOrCreate(
            ['email' => 'owner@example.com'],
            [
                'name' => 'Owner User',
                'password' => Hash::make('password123'),
                'role' => 'owner',
            ]
        );

<<<<<<< HEAD
        // Extra dev account (matches common demo login input)
=======
>>>>>>> leakk/new-feature-owner
        User::updateOrCreate(
            ['email' => 'owner@test.com'],
            [
                'name' => 'Owner Test',
<<<<<<< HEAD
                // Match the credentials you want to use in the UI.
                'password' => Hash::make('Password@123'),
                'role' => 'owner',
            ]
        );
=======
                'password' => Hash::make('password123'),
                'role' => 'owner',
            ]
        );

        User::factory()->create([
            'name' => 'Owner 1',
            'email' => 'owner1@test.com',
            'role' => 'owner'
        ]);
>>>>>>> leakk/new-feature-owner

        User::updateOrCreate(
            ['email' => 'owner1@test.com'],
            [
                'name' => 'Owner 1',
                'password' => Hash::make('password123'),
                'role' => 'owner',
            ]
        );

        User::updateOrCreate(
            ['email' => 'customer1@test.com'],
            [
                'name' => 'Customer 1',
                'password' => Hash::make('password123'),
                'role' => 'customer',
            ]
        );
    }
}

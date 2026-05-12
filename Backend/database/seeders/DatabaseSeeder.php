<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create roles first
        $roles = [
            'admin'    => Role::firstOrCreate(['name' => 'admin'],    ['description' => 'Administrator']),
            'customer' => Role::firstOrCreate(['name' => 'customer'], ['description' => 'Customer']),
            'owner'    => Role::firstOrCreate(['name' => 'owner'],    ['description' => 'Property Owner']),
        ];

        // 2. Seed fixed users with role_id
        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name'     => 'Admin User',
                'password' => Hash::make('password123'),
                'role_id'  => $roles['admin']->role_id,
                'status'   => 'active',
            ]
        );

        User::updateOrCreate(
            ['email' => 'customer@example.com'],
            [
                'name'     => 'Customer User',
                'password' => Hash::make('password123'),
                'role_id'  => $roles['customer']->role_id,
                'status'   => 'active',
            ]
        );

        User::updateOrCreate(
            ['email' => 'owner@example.com'],
            [
                'name'     => 'Owner User',
                'password' => Hash::make('password123'),
                'role_id'  => $roles['owner']->role_id,
                'status'   => 'active',
            ]
        );

        User::updateOrCreate(
            ['email' => 'owner@test.com'],
            [
                'name'     => 'Owner Test',
                'password' => Hash::make('password123'),
                'role_id'  => $roles['owner']->role_id,
                'status'   => 'active',
            ]
        );

        // 3. Factory users — pass role_id directly
        User::factory()->create([
            'name'    => 'Owner 1',
            'email'   => 'owner1@test.com',
            'role_id' => $roles['owner']->role_id,
        ]);

        User::factory()->create([
            'name'    => 'Customer 1',
            'email'   => 'customer1@test.com',
            'role_id' => $roles['customer']->role_id,
        ]);

        // 4. Call other seeders
        $this->call(HotelSeeder::class);
    }
}
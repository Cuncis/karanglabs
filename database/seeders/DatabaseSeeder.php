<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::firstOrCreate(
            ['email' => 'karang@karanglabs.cloud'],
            [
                'name' => 'Karang',
                'password' => bcrypt('rsz761wc73'),
                'email_verified_at' => now(),
            ]
        );
    }
}

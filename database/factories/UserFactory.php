<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'role' => User::ROLE_MEMBER,
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Indicate that the user has purchased and been granted Studio access.
     */
    public function withStudioAccess(): static
    {
        return $this->state(fn (array $attributes) => [
            'has_studio_access' => true,
            'studio_access_granted_at' => now(),
        ]);
    }

    /**
     * Indicate that the user holds a whitelabel reseller license.
     */
    public function reseller(): static
    {
        return $this->state(fn (array $attributes) => [
            'has_studio_access' => true,
            'studio_access_granted_at' => now(),
            'role' => User::ROLE_RESELLER,
            'license_key' => 'KLR-TEST-'.strtoupper(fake()->bothify('####-????')),
        ]);
    }

    /**
     * Indicate that the user is an admin (owner).
     */
    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'has_studio_access' => true,
            'studio_access_granted_at' => now(),
            'role' => User::ROLE_ADMIN,
        ]);
    }
}

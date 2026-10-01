<?php

namespace Database\Factories;

use App\Models\SalesNavigatorLead;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SalesNavigatorLead>
 */
class SalesNavigatorLeadFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'title' => fake()->jobTitle(),
            'company' => fake()->company(),
            'company_url' => 'https://www.linkedin.com/sales/company/'.fake()->unique()->numberBetween(1000, 999999),
            'location' => fake()->city(),
            'profile_url' => 'https://www.linkedin.com/sales/lead/'.fake()->unique()->uuid(),
            'connection_degree' => fake()->randomElement(['1st', '2nd', '3rd']),
            'about' => fake()->paragraph(),
            'status' => SalesNavigatorLead::STATUS_NOT_CONTACTED,
        ];
    }
}

<?php

namespace Database\Factories;

use App\Models\Dork;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Dork>
 */
class DorkFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'label' => fake()->words(3, true),
            'query' => 'site:*.id inurl:'.fake()->word(),
            'is_active' => true,
            'last_run_at' => null,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes): array => [
            'is_active' => false,
        ]);
    }
}

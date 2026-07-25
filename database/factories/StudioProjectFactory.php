<?php

namespace Database\Factories;

use App\Models\StudioProject;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StudioProject>
 */
class StudioProjectFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'engine' => 'landing-page',
            'title' => fake()->company(),
            'brief' => ['brand' => fake()->company(), 'style' => 'Minimalis Modern'],
            'prompt' => fake()->paragraph(),
        ];
    }
}
